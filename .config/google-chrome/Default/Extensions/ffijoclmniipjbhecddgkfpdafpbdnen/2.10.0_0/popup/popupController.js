class PopupController {
    constructor(isPagePopup = false) {
        this.isPagePopup = isPagePopup;
        this.initializeAction = this.wrapBackgroundAction('initialize');
        this.openTrackerAction = this.wrapBackgroundAction('openTracker');
        this.openPageAction = this.wrapBackgroundAction('openPage');
        this.loginAction = this.wrapBackgroundAction('login');
        this.isConnectionRetryEnabledAction = this.wrapBackgroundAction('isConnectionRetryEnabled');
        this.retryAction = this.wrapBackgroundAction('retry');
        this.fixTimerAction = this.wrapBackgroundAction('fixTimer');
        this.putTimerAction = this.wrapBackgroundAction('putTimer');
        this.saveProjectMapAction = this.wrapBackgroundAction('saveProjectMap');
        this.saveDescriptionMapAction = this.wrapBackgroundAction('saveDescriptionMap');
        this.openOptionsPage = this.wrapBackgroundAction('openOptionsPage');
        this.getRecentTasksAction = this.wrapBackgroundAction('getRecentTasks');
        this._forms = {
            login: '#login-form',
            fix: '#fix-form',
            view: '#view-form',
            create: '#create-form'
        };
        this._messageTypes = {
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        this._states = {
            loading: 'loading',
            retrying: 'retrying',
            authenticating: 'authenticating',
            fixing: 'fixing',
            creating: 'creating',
            viewing: 'viewing'
        };
        this._weekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
        this._monthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
        this.noProjectOption = { id: 0, text: 'No project' };
        this.createProjectOption = { id: -1, text: 'New project' };
        this.initControls();
        this.getData(null);
    }
    getData(accountId) {
        this.switchState(this._states.loading);
        return this.initializeAction({ accountId, includeRecentTasks: !this.isPagePopup }).then(data => {
            this.setData(data);
            if (this._profile.accountMembership.length > 1) {
                this.fillAccountSelector(data.profile, data.accountId);
            }
            if (data.timer.isStarted && this.isLongRunning(data.timer.startTime)) {
                this.fillFixForm(data.timer);
                this.switchState(this._states.fixing);
            }
            else if (!this.isPagePopup && data.timer && data.timer.isStarted) {
                this.fillViewForm(data.timer, data.accountId);
                this.fillCreateForm(data.defaultProjectId);
                this.switchState(this._states.viewing);
            }
            else {
                this.fillCreateForm(data.defaultProjectId);
                this.switchState(this._states.creating);
            }
        }).catch(error => {
            this.isConnectionRetryEnabledAction().then(retrying => {
                if (retrying) {
                    this.switchState(this._states.retrying);
                }
                else {
                    this.switchState(this._states.authenticating);
                }
            });
        });
    }
    callBackground(request) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(request, (response) => {
                resolve(response);
            });
        });
    }
    close() {
        window.close();
    }
    setData(data) {
        if (data.timer) {
            this._activeTimer = data.timer;
            this._newIssue = this._newIssue || data.newIssue;
            this._accountId = data.accountId;
            this._profile = data.profile;
            this._timeFormat = data.profile.timeFormat;
            this._projects = data.projects;
            this._clients = data.clients;
            this._tags = data.tags.filter(tag => !!tag).sort((a, b) => this.compareTags(a, b));
            this._constants = data.constants;
            this._canCreateProjects = data.canCreateProjects;
            this._canCreateTags = data.canCreateTags;
            this._requiredFields = data.requiredFields;
        }
        else {
            this.close();
        }
    }
    putTimer(accountId, timer) {
        return this.putTimerAction({ accountId, timer }).then(() => {
            this.close();
        });
    }
    compareTags(t1, t2) {
        let diff = (t1.isWorkType ? 1 : 0) - (t2.isWorkType ? 1 : 0);
        if (diff) {
            return diff;
        }
        let name1 = t1.tagName.toLowerCase();
        let name2 = t2.tagName.toLowerCase();
        return name1 == name2 ? 0 : (name1 > name2 ? 1 : -1);
    }
    wrapBackgroundAction(action) {
        return (data) => {
            return new Promise((resolve, reject) => {
                this.callBackground({
                    action: action,
                    data: data
                }).then(response => {
                    if (response.error) {
                        reject(response.error);
                    }
                    else {
                        resolve(response.data);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        };
    }
    switchState(name) {
        let state = $('content').attr('class');
        if (state == name) {
            return;
        }
        $('content').attr('class', name);
        if (name == this._states.creating) {
            this.focusCreatingForm();
            this.fillRecentTaskSelector();
        }
        let logoText;
        let accountSelectorDisabled = true;
        switch (name) {
            case this._states.retrying:
                logoText = 'Error';
                break;
            case this._states.viewing:
                logoText = 'Active Timer';
                break;
            case this._states.creating:
                logoText = 'Start Timer';
                accountSelectorDisabled = false;
                break;
            case this._states.fixing:
                logoText = 'Fix Timer';
                break;
            case this._states.authenticating:
                logoText = 'Not Connected';
                break;
            default:
                logoText = '';
                break;
        }
        $('.logo-text').text(logoText);
        $('#account-selector .dropdown-toggle').prop('disabled', accountSelectorDisabled);
    }
    getAccountMembership(id) {
        return this._profile && this._profile.accountMembership.find(_ => _.account.accountId == id);
    }
    fillAccountSelector(profile, accountId) {
        if (!profile) {
            return;
        }
        let membership = profile.accountMembership;
        let selectedAccount = membership.find(_ => _.account.accountId == accountId).account;
        let dropdown = $('#account-selector');
        $('.dropdown-toggle-text', dropdown).text(selectedAccount.accountName);
        let menu = $('.dropdown-menu', dropdown);
        menu.empty();
        let items = membership.map(_ => {
            let item = $('<button></button>')
                .addClass('dropdown-menu-item')
                .toggleClass('selected', _.account.accountId == accountId)
                .attr('data-value', _.account.accountId)
                .text(_.account.accountName);
            return item;
        });
        menu.append(items);
        dropdown.show();
    }
    changeAccount(accountId) {
        let state = $('content').attr('class');
        this._newIssue = {};
        this.getData(accountId).then(() => {
            this.switchState(state);
        });
    }
    fillFixForm(timer) {
        if (timer && timer.details) {
            $(this._forms.fix + ' .description').text(this.toDescription(timer.details.description));
            $(this._forms.fix + ' .startTime').text(this.toLongRunningDurationString(timer.startTime));
        }
    }
    getTaskLinkData(task) {
        if (!task) {
            return {};
        }
        let url = '';
        let text = '';
        const integrationUrl = task.integrationUrl || task.serviceUrl;
        const relativeUrl = task.relativeIssueUrl || task.issueUrl;
        const showIssueId = task.showIssueId;
        const issueId = task.externalIssueId || '' + (task.projectTaskId || '') || task.issueId;
        if (integrationUrl && relativeUrl) {
            url = integrationUrl + relativeUrl;
            if (showIssueId) {
                text = issueId;
            }
        }
        else if (issueId) {
            url = `${this._constants.serviceUrl}#/tasks/${this._accountId}?id=${issueId}`;
        }
        return { url, text };
    }
    fillTaskLink(link, url, text) {
        if (!url) {
            return;
        }
        link.attr('href', url);
        link.attr('target', '_blank');
        const iconClass = 'fa fa-external-link';
        if (text) {
            link.text(text);
            link.removeClass(iconClass);
        }
        else {
            link.text('');
            link.addClass(iconClass);
        }
    }
    fillViewForm(timer, accountId) {
        let details = timer && timer.details;
        if (!details) {
            return;
        }
        $(this._forms.view + ' .time').text(this.toDurationString(timer.startTime));
        let projectTask = details.projectTask;
        let { url, text } = this.getTaskLinkData(projectTask);
        if (url) {
            this.fillTaskLink($(this._forms.view + ' .task .id .link'), url, text);
            $(this._forms.view + ' .task')
                .attr('title', projectTask.description)
                .find('.name')
                .text(projectTask.description);
            if (projectTask.description == details.description) {
                $(this._forms.view + ' .notes').hide();
            }
            else {
                let description = this.toDescription(details.description);
                $(this._forms.view + ' .notes')
                    .attr('title', description)
                    .find('.description')
                    .text(description);
            }
        }
        else {
            $(this._forms.view + ' .task')
                .attr('title', this.toDescription(details.description))
                .find('.name')
                .text(this.toDescription(details.description));
            $(this._forms.view + ' .notes').hide();
        }
        let projectName = this.toProjectName(details.projectId);
        if (projectName) {
            $(this._forms.view + ' .project .name').text(projectName).show();
        }
        else {
            $(this._forms.view + ' .project').hide();
        }
        if (timer.tagsIdentifiers && timer.tagsIdentifiers.length) {
            $(this._forms.view + ' .tags .items').append(this.makeTimerTagsElement(timer.tagsIdentifiers)).show();
        }
        else {
            $(this._forms.view + ' .tags').hide();
        }
    }
    fillCreateForm(projectId) {
        $(this._forms.create + ' .task-recent').toggle(!this.isPagePopup);
        let task = $(this._forms.create + ' .task');
        let description = $(this._forms.create + ' .description');
        let descriptionInput = description.find('.input');
        descriptionInput.attr('maxlength', 400);
        let issue = this._newIssue;
        let { url, text } = this.getTaskLinkData(issue);
        if (url) {
            this.fillTaskLink(task.find('.link'), url, text);
            task.css('display', 'inline-flex');
            task.find('.name').text(issue.issueName);
            description.find('.label').text('Notes');
            description.removeClass('required');
            descriptionInput.attr('placeholder', 'Describe your activity');
            descriptionInput.val(issue.description);
        }
        else {
            task.css('display', 'none');
            description.find('.label').text('Task');
            description.toggleClass('required', !!(this._requiredFields.description && !this._requiredFields.taskLink));
            descriptionInput.attr('placeholder', 'Enter description');
            descriptionInput.val(issue.description || issue.issueName);
        }
        this.initProjectSelector(projectId);
        $(this._forms.create + ' .new-project .input').attr('maxlength', 255);
        $(this._forms.create + ' .project').toggleClass('required', !!this._requiredFields.project);
        this.initTagSelector(projectId);
        $(this._forms.create + ' .tags').toggleClass('required', !!this._requiredFields.tags);
    }
    focusCreatingForm() {
        setTimeout(() => {
            $(window).focus();
            if (this.isPagePopup && this._newIssue.issueName) {
                $(this._forms.create + ' .project .input').select2('open').select2('close');
            }
            else {
                $(this._forms.create + ' .description .input').focus().select();
            }
        }, 100);
    }
    fillRecentTaskSelector() {
        let dropdown = $('#recent-task-selector');
        let toggle = $('.dropdown-toggle', dropdown);
        toggle.prop('disabled', true);
        let menu = $('.dropdown-menu', dropdown);
        menu.empty();
        return this.getRecentTasksAction(this._accountId).then(recentTasks => {
            this._recentTasks = recentTasks;
            if (this._recentTasks && this._recentTasks.length) {
                toggle.prop('disabled', false);
                let items = this._recentTasks.map((task, index) => this.formatRecentTaskSelectorItem(task, index));
                menu.append(items);
            }
        });
    }
    formatRecentTaskSelectorItem(task, index) {
        let item = $('<button></button>')
            .addClass('dropdown-menu-item')
            .attr('data-value', index);
        let description = $('<span>').text(task.details.description);
        description.attr('title', task.details.description);
        item.append(description);
        if (task.details.projectId) {
            let project = this.formatExistingProjectCompact(task.details.projectId);
            item.append(project);
        }
        return item;
    }
    fillFormWithRecentTask(index) {
        if (!this._recentTasks || !this._recentTasks.length) {
            return;
        }
        let task = this._recentTasks[index];
        if (!task) {
            return;
        }
        let issue = {};
        let projectId = null;
        issue.description = task.details.description;
        if (task.tagsIdentifiers) {
            issue.tagNames = task.tagsIdentifiers.map(id => {
                let tag = this.getTag(id);
                return tag && tag.tagName;
            }).filter(_ => !!_);
        }
        if (task.details) {
            let project = this.getProject(task.details.projectId);
            if (project) {
                issue.projectName = project.projectName;
                projectId = project.projectId;
            }
            let projectTask = task.details.projectTask;
            if (projectTask) {
                issue.issueId = projectTask.externalIssueId || '' + (projectTask.projectTaskId || '');
                issue.issueName = projectTask.description;
                issue.issueUrl = projectTask.relativeIssueUrl;
                issue.serviceUrl = projectTask.integrationUrl;
                issue.showIssueId = projectTask.showIssueId;
            }
        }
        this._newIssue = issue;
        this.fillCreateForm(projectId);
        this.focusCreatingForm();
    }
    getDuration(startTime) {
        let startDate = startTime instanceof Date ? startTime : new Date(startTime);
        let result = new Date().getTime() - startDate.getTime();
        return result > 0 ? result : 0;
    }
    toDurationString(startTime) {
        const MINUTE = 1000 * 60;
        const HOUR = MINUTE * 60;
        let duration = this.getDuration(startTime);
        let hours = Math.floor(duration / HOUR);
        let minutes = Math.floor((duration - hours * HOUR) / MINUTE);
        let result = [];
        if (hours) {
            result.push(hours + ' h');
        }
        result.push(minutes + ' min');
        return result.join(' ');
    }
    isLongRunning(startTime) {
        const HOUR = 1000 * 60 * 60;
        const LONG_RUNNING_DURATION = this._constants.maxTimerHours * HOUR;
        let duration = this.getDuration(startTime);
        return duration >= LONG_RUNNING_DURATION;
    }
    toLongRunningDurationString(startTime) {
        let duration = this.getDuration(startTime);
        let now = new Date();
        let durationToday = this.getDuration(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
        let durationYesterday = this.getDuration(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
        let startDate = new Date(startTime);
        let result = '';
        if (duration <= durationToday) {
            result = 'Started today';
        }
        else if (duration <= durationYesterday) {
            result = 'Started yesterday';
        }
        else {
            result = 'Started ' + this._weekdaysShort[startDate.getDay()] + ', ' + startDate.getDate() + ' ' + this._monthsShort[startDate.getMonth()];
        }
        let hours = startDate.getHours();
        let minutes = startDate.getMinutes();
        if (this._timeFormat == 'H:mm') {
            result += ' at ' + hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
        }
        else {
            let period;
            if (hours >= 12) {
                period = 'pm';
                hours -= 12;
            }
            else {
                period = 'am';
            }
            result += ' at ' + (hours == 0 ? 12 : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + period;
        }
        return result;
    }
    toDescription(description) {
        return description || '(No description)';
    }
    toProjectName(projectId) {
        if (projectId && this._projects) {
            let projects = this._projects.filter(_ => _.projectId === projectId);
            if (projects.length) {
                return projects[0].projectName;
            }
        }
        return '';
    }
    getProject(id) {
        let project = null;
        if (this._projects) {
            let projects = this._projects.filter(project => project.projectId === id);
            if (projects.length) {
                project = projects[0];
            }
        }
        return project;
    }
    getClient(id) {
        if (this._clients) {
            let clients = this._clients.filter(client => client.clientId === id);
            if (clients.length) {
                return clients[0];
            }
        }
        return null;
    }
    getTag(id) {
        if (this._tags) {
            let tags = this._tags.filter(tag => tag.tagId === id);
            if (tags.length) {
                return tags[0];
            }
        }
        return null;
    }
    makeTimerTagsElement(timerTags) {
        let sortedTags = timerTags.map(id => this.getTag(id))
            .filter(tag => !!tag)
            .sort(this.compareTags);
        let container = $('<span>');
        sortedTags.forEach((tag, i) => {
            let span = $('<span>').addClass('tag').addClass('tag-default');
            if (tag.isWorkType) {
                let i = $('<i>').addClass('tag-icon').addClass('fa fa-dollar');
                span.append(i);
            }
            span.append($('<span>').text(tag.tagName));
            container.append(span);
        });
        return container;
    }
    makeTagItem(name, isWorkType) {
        return {
            id: name,
            text: name,
            isWorkType: !!isWorkType
        };
    }
    makeTagItems(projectId = null) {
        let items = [];
        let accountTagNames = {};
        let projectWorkTypeIds = {};
        let project = this.getProject(projectId);
        if (project) {
            project.workTypeIdentifires.forEach(id => {
                projectWorkTypeIds[id] = true;
            });
        }
        this._tags.forEach(tag => {
            let key = tag.tagName.toLowerCase();
            accountTagNames[key] = true;
            if (!project || !tag.isWorkType || projectWorkTypeIds[tag.tagId]) {
                items.push(this.makeTagItem(tag.tagName, tag.isWorkType));
            }
        });
        if (this._canCreateTags && this._newIssue.tagNames) {
            this._newIssue.tagNames.forEach(tagName => {
                let key = tagName.toLowerCase();
                if (!accountTagNames[key]) {
                    items.push(this.makeTagItem(tagName, false));
                }
            });
        }
        return items;
    }
    makeTagSelectedItems() {
        return this._newIssue.tagNames || [];
    }
    initProjectSelector(defaultProjectId) {
        let query = this._forms.create + ' .project .input';
        let existingProjectId;
        let newProjectName = this._newIssue && this._newIssue.projectName;
        let items = [];
        if (this._canCreateProjects) {
            items.push(this.createProjectOption);
        }
        items.push(this.noProjectOption);
        items.push(...this._projects.map(project => {
            let projectCode = project.projectCode ? ` [${project.projectCode}]` : '';
            let projectClient = project.clientId ? ` / ${this.getClient(project.clientId).clientName}` : '';
            if (newProjectName && project.projectName.toLowerCase() == newProjectName.toLowerCase()) {
                existingProjectId = project.projectId;
            }
            return { id: project.projectId, text: project.projectName + projectCode + projectClient };
        }));
        if (!defaultProjectId) {
            if (existingProjectId) {
                defaultProjectId = existingProjectId;
            }
            else if (this.isPagePopup && this._canCreateProjects && newProjectName) {
                defaultProjectId = this.createProjectOption.id;
            }
            else {
                defaultProjectId = this.noProjectOption.id;
            }
        }
        $(query)
            .empty()
            .select2({
            data: items,
            templateSelection: (options) => this.formatSelectedProject(options),
            templateResult: (options) => this.formatProjectItem(options)
        })
            .val(defaultProjectId.toString())
            .trigger('change');
        let data = $(query).select2('data');
        let selectedItem = data[0];
        if (selectedItem) {
            selectedItem.selected = true;
        }
    }
    formatProjectItem(data) {
        let id = parseInt(data.id);
        if (!id) {
            return $('<span>').text(data.text);
        }
        if (id == -1) {
            return $('<strong>').text(data.text);
        }
        return this.formatExistingProject(data, true);
    }
    formatSelectedProject(data) {
        let id = parseInt(data.id);
        if (!id) {
            return $('<span class="mute-text">').text('Select project');
        }
        if (id == -1) {
            return $('<span>').text(data.text);
        }
        return this.formatExistingProject(data, false);
    }
    formatExistingProject(data, includeCodeAndClient) {
        let projectId = parseInt(data.id);
        let result = $('<span class="flex-container-with-overflow" />');
        let projectPartsContainer = $('<span class="text-overflow" />');
        let project = this.getProject(projectId);
        let avatarElement = this.formatProjectAvatar(project);
        result.append(avatarElement);
        let projectName = project ? project.projectName : data.text;
        let projectNameElement = $('<span class="text-overflow">').text(projectName);
        projectPartsContainer.append(projectNameElement);
        let projectTitle = projectName;
        if (project && includeCodeAndClient) {
            if (project.projectCode) {
                let projectCode = ' [' + project.projectCode + ']';
                let projectCodeElement = $('<span />').text(projectCode);
                projectPartsContainer.append(projectCodeElement);
                projectTitle += projectCode;
            }
            if (project.clientId) {
                let projectClient = ' / ' + this.getClient(project.clientId).clientName;
                let projectClientElement = $('<span class="text-muted" />').text(projectClient);
                projectPartsContainer.append(projectClientElement);
                projectTitle += projectClient;
            }
        }
        projectPartsContainer.attr('title', projectTitle);
        result.append(projectPartsContainer);
        return result;
    }
    formatExistingProjectCompact(id) {
        let result = $('<span class="" />');
        let project = this.getProject(id);
        result.append(this.formatProjectAvatar(project));
        let name = project ? project.projectName : '';
        result.append(name);
        result.attr('title', name);
        return result;
    }
    formatProjectAvatar(project) {
        let avatar = project && project.avatar || 'Content/Avatars/project.svg';
        let avatarPath = `${this._constants.serviceUrl}${avatar}`;
        return $(`<img src="${avatarPath}" />`).addClass('project-avatar-image');
    }
    initTagSelector(projectId = null) {
        let query = this._forms.create + ' .tags';
        let items = this.makeTagItems(projectId);
        let selectedItems = this.makeTagSelectedItems();
        let allowNewItems = this._canCreateTags;
        $(query + ' .input')
            .empty()
            .select2({
            data: items,
            tags: allowNewItems,
            matcher: (a, b) => {
                let params = a;
                let option = b;
                let term = $.trim(params.term || "").toLowerCase();
                let text = $(option.element).text().toLowerCase();
                let isSelected = !!(option.element && option.element.selected);
                let isTermIncluded = text.length >= term.length && text.indexOf(term) > -1;
                let isEqual = text == term;
                if ((isSelected && isEqual) ||
                    (!isSelected && isTermIncluded)) {
                    return option;
                }
                return null;
            },
            createTag: (params) => {
                let name = $.trim(params.term);
                if (name) {
                    let foundOptions = $(query)
                        .find('option')
                        .filter((i, option) => $(option).text().toLowerCase() == name.toLowerCase());
                    if (!foundOptions.length) {
                        return this.makeTagItem(name);
                    }
                }
            },
            templateSelection: (options) => this.formatTag(options, false),
            templateResult: (options) => this.formatTag(options, true)
        })
            .val(selectedItems)
            .trigger('change');
        $(query + ' .select2-search__field').attr('maxlength', 50);
    }
    formatTag(data, useIndentForTag) {
        let textSpan = $('<span>').text(data.text);
        if (data.isWorkType) {
            let i = $('<i>').addClass('tag-icon').addClass('fa fa-dollar');
            return $('<span>').append(i).append(textSpan);
        }
        if (useIndentForTag) {
            textSpan.addClass('tag-without-icon');
        }
        return textSpan;
    }
    showRequiredInputError(query) {
        let field = $(query);
        let fieldInput = $('.input', field);
        field.addClass('error');
        fieldInput.focus();
        if (!field.hasClass('validated')) {
            field.addClass('validated');
            fieldInput.on('input', (event) => {
                field.toggleClass('error', !$(event.target).val());
            });
        }
    }
    showRequiredSelectError(query) {
        let field = $(query);
        let fieldSelect = $('.input', field);
        field.addClass('error');
        fieldSelect.select2('open').select2('close');
        if (!field.hasClass('validated')) {
            field.addClass('validated');
            fieldSelect.on('change', (event) => {
                field.toggleClass('error', $(event.target).val() == 0);
            });
        }
    }
    checkRequiredFields(timer) {
        $(this._forms.create + ' .error').removeClass('error');
        if (this._requiredFields.description && !timer.issueName && !timer.description) {
            this.showRequiredInputError(this._forms.create + ' .description');
        }
        else if (this._requiredFields.project && !timer.projectName) {
            if ($(this._forms.create + ' .project .input').val() == -1) {
                this.showRequiredInputError(this._forms.create + ' .new-project');
            }
            else {
                this.showRequiredSelectError(this._forms.create + ' .project');
            }
        }
        else if (this._requiredFields.tags && (!timer.tagNames || !timer.tagNames.length)) {
            this.showRequiredSelectError(this._forms.create + ' .tags');
        }
        return $(this._forms.create + ' .error').length == 0;
    }
    initControls() {
        $('#site-link').click(() => (this.onSiteLinkClick(), false));
        $('#task-link').click(() => (this.onTaskLinkClick(), false));
        $('#login').click(() => (this.onLoginClick(), false));
        $('#retry').click(() => (this.onRetryClick(), false));
        $('#fix').click(() => (this.onFixClick(), false));
        $('#start').click(() => (this.onStartClick(), false));
        $('#stop').click(() => (this.onStopClick(), false));
        $('#create').click(() => (this.onCreateClick(), false));
        $(this._forms.create + ' .project .input').change(() => (this.onProjectSelectChange(), false));
        $('.cancel-btn').click(() => (this.onCancelClick(), false));
        $('#settings-btn').click(() => (this.onSettingsClick(), false));
        this.initDropdown('#account-selector', (accountId) => {
            this.changeAccount(accountId);
        });
        this.initDropdown('#recent-task-selector', (index) => {
            this.fillFormWithRecentTask(index);
        });
        $('#clear-create-form').click(() => this.onClearCreateFormClick());
        window.addEventListener('keydown', event => {
            if (event.keyCode == 27) {
                if (!$('body > .select2-container').length) {
                    this.close();
                }
            }
        }, true);
    }
    initDropdown(selector, onItemClick) {
        let dropdown = $(selector);
        let toggle = $('.dropdown-toggle', dropdown);
        let toggleText = $('.dropdown-toggle-text', toggle);
        let toggleIcon = $('.fa', toggle);
        let menu = $('.dropdown-menu', dropdown);
        function checkCloseClick(event) {
            if (!$(event.target).closest(dropdown).length) {
                toggleDropdown(false);
            }
        }
        function toggleDropdown(open) {
            dropdown.toggleClass('open', open);
            toggleIcon.toggleClass('fa-angle-up', open);
            toggleIcon.toggleClass('fa-angle-down', !open);
            if (open) {
                $(document.body).on('click', checkCloseClick);
            }
            else {
                $(document.body).off('click', checkCloseClick);
            }
        }
        toggle.click(() => {
            if (toggle.prop('disabled')) {
                return;
            }
            let isOpen = dropdown.hasClass('open');
            toggleDropdown(!isOpen);
        });
        menu.click(event => {
            let target = $(event.target);
            let item = target.hasClass('dropdown-menu-item') ? target : target.closest('.dropdown-menu-item');
            if (!item.length) {
                return;
            }
            let value = $(item).attr('data-value');
            onItemClick(value);
            toggleDropdown(false);
        });
    }
    onCancelClick() {
        this.close();
    }
    onSettingsClick() {
        this.openOptionsPage();
    }
    onProjectSelectChange() {
        const newProjectContainer = $(this._forms.create + ' .new-project');
        const newProjectInput = $('.input', newProjectContainer);
        let value = $(this._forms.create + ' .project .input').val();
        if (value == -1) {
            let issueProjectName = (this._newIssue.projectName) || '';
            newProjectInput.val(issueProjectName);
            newProjectContainer.css('display', 'block');
        }
        else {
            newProjectContainer.css('display', 'none');
        }
        this.initTagSelector(parseInt(value));
    }
    onSiteLinkClick() {
        this.openTrackerAction();
        this.close();
    }
    onTaskLinkClick() {
        let url = $('#task-link').attr('href');
        if (url) {
            this.openPageAction(url);
            this.close();
        }
    }
    onLoginClick() {
        this.loginAction();
        this.close();
    }
    onRetryClick() {
        this.retryAction();
        this.close();
    }
    onFixClick() {
        this.fixTimerAction();
        this.close();
    }
    onStartClick() {
        let timer = Object.assign({}, this._newIssue);
        let selectedProject = $(this._forms.create + ' .project .input').select2('data')[0];
        let selectedProjectId = Number(selectedProject.id);
        if (!selectedProject || !selectedProject.selected || !selectedProjectId) {
            timer.projectName = '';
        }
        else if (selectedProjectId > 0) {
            let project = this._projects.filter(_ => _.projectId == selectedProjectId)[0];
            timer.projectName = project && project.projectName;
            timer.projectId = project && project.projectId;
        }
        else {
            timer.projectName = $.trim($(this._forms.create + ' .new-project .input').val());
        }
        timer.isStarted = true;
        timer.description = $(this._forms.create + ' .description .input').val();
        timer.tagNames = $(this._forms.create + ' .tags .input').select().val() || [];
        if (!this.checkRequiredFields(timer)) {
            return;
        }
        this.putTimer(this._accountId, timer).then(() => {
            let projectName = this._newIssue.projectName || '';
            let newProjectName = timer.projectName || '';
            let foundProjects = this._projects.filter(_ => _.projectName == newProjectName);
            let newProject = foundProjects.find(p => p.projectId == timer.projectId) || foundProjects[0];
            if (newProjectName == projectName && foundProjects.length < 2) {
                this.saveProjectMapAction({ projectName, projectId: null });
            }
            else if (newProject) {
                this.saveProjectMapAction({ projectName, projectId: newProject.projectId });
            }
            if (timer.issueId && timer.description != this._newIssue.description) {
                this.saveDescriptionMapAction({
                    taskName: this._newIssue.issueName,
                    description: timer.description
                });
            }
        });
    }
    onStopClick() {
        this.putTimer(this._profile.activeAccountId, { isStarted: false });
    }
    onCreateClick() {
        this.switchState(this._states.creating);
    }
    onClearCreateFormClick() {
        this._newIssue = {};
        this.fillCreateForm(null);
        this.focusCreatingForm();
    }
}
