var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ExtensionBase {
    constructor() {
        this.buttonState = 0;
        this.connection = new SignalRConnection();
        this.defaultApplicationUrl = 'https://app.tmetric.com/';
        this.defaultSignalRUrl = 'https://signalr.tmetric.com/';
        this._issuesDurationsCache = {};
        this._accountScopeCache = {};
        this._popupActions = {};
        this.accountToProjectMapKey = 'accountToProjectMap';
        this.taskNameToDescriptionMapKey = 'taskNameToDescriptionMap';
        this.updateState();
        this.serviceUrl = this.normalizeUrlLastSlash(this.getTestValue('tmetric.url') || this.defaultApplicationUrl);
        this.signalRUrl = this.normalizeUrlLastSlash(this.getTestValue('tmetric.signalRUrl') || this.defaultSignalRUrl);
        this._constants = this.getDefaultConstants();
        this.extraHours = this.getTestValue('tmetric.extraHours');
        if (this.extraHours) {
            this.extraHours = parseFloat(this.extraHours);
        }
        else {
            this.extraHours = 0;
        }
        this.connection.onUpdateTimer((timer) => __awaiter(this, void 0, void 0, function* () {
            if (timer == null) {
                this.clearIssuesDurationsCache();
            }
            this._timer = timer;
            if (timer && timer.details) {
                let project = yield this.getProject(timer.details.projectId);
                timer.projectName = project && project.projectName;
            }
            this.updateState();
            this.sendToTabs({ action: 'setTimer', data: timer });
            if (timer) {
                let action = this._actionOnConnect;
                if (action) {
                    this._actionOnConnect = null;
                    action();
                }
            }
        }));
        this.connection.onUpdateTracker(timeEntries => {
            this._timeEntries = timeEntries;
            this.updateState();
        });
        this.connection.onUpdateProfile(profile => {
            this._userProfile = profile;
        });
        this.connection.onUpdateActiveAccount(acountId => {
            this.clearIssuesDurationsCache();
        });
        this.connection.onInvalidateAccountScopeCache(accountId => {
            this.invalidateAccountScopeCache(accountId);
        });
        this.connection.onRemoveExternalIssuesDurations(identifiers => {
            this.removeIssuesDurationsFromCache(identifiers);
        });
        this.connection
            .init(this.serviceUrl, this.signalRUrl)
            .then(() => this.connection.getVersion());
        this.listenPopupAction('initialize', this.initializePopupAction);
        this.listenPopupAction('openTracker', this.openTrackerPagePopupAction);
        this.listenPopupAction('openPage', this.openPagePopupAction);
        this.listenPopupAction('isConnectionRetryEnabled', this.isConnectionRetryEnabledPopupAction);
        this.listenPopupAction('retry', this.retryConnectionPopupAction);
        this.listenPopupAction('login', this.loginPopupAction);
        this.listenPopupAction('fixTimer', this.fixTimerPopupAction);
        this.listenPopupAction('putTimer', data => {
            this.putExternalTimer(data.timer, null, data.accountId);
            return Promise.resolve();
        });
        this.listenPopupAction('hideAllPopups', () => {
            this.sendToTabs({ action: 'hidePopup' });
            return Promise.resolve(null);
        });
        this.listenPopupAction('saveProjectMap', ({ projectName, projectId }) => {
            this.setProjectMap(this._userProfile.activeAccountId, projectName, projectId);
            return Promise.resolve(null);
        });
        this.listenPopupAction('saveDescriptionMap', ({ taskName, description }) => {
            this.setDescriptionMap(taskName, description);
            return Promise.resolve(null);
        });
        this.listenPopupAction('openOptionsPage', () => {
            chrome.runtime.openOptionsPage();
            return Promise.resolve(null);
        });
        this.listenPopupAction('getRecentTasks', this.getRecentTasksAction);
        this.registerTabsUpdateListener();
        this.registerTabsRemoveListener();
        this.registerMessageListener();
        let setUpdateTimeout = () => setTimeout(() => {
            this.updateState();
            setUpdateTimeout();
        }, (60 - new Date().getSeconds()) * 1000);
        setUpdateTimeout();
    }
    getDefaultConstants() {
        let constants = {
            maxTimerHours: 12,
            extensionName: chrome.runtime.getManifest().name,
            browserSchema: this.getBrowserSchema(),
            extensionUUID: this.getExtensionUUID(),
            serviceUrl: this.serviceUrl
        };
        return constants;
    }
    getDefaultLoginPosition() {
        return {
            width: 420,
            height: 535,
            left: 400,
            top: 300
        };
    }
    getBrowserSchema() {
        throw new Error('Not implemented');
    }
    getExtensionUUID() {
        throw new Error('Not implemented');
    }
    createLoginDialog(width, height, left, top) {
        chrome.windows.create({
            left,
            top,
            width,
            height,
            url: this.getLoginUrl(),
            type: 'popup'
        }, popupWindow => {
            let popupTab = popupWindow.tabs[0];
            this.loginWinId = popupWindow.id;
            this.loginTabId = popupTab.id;
            this.loginWindowPending = false;
            let updateInfo = { focused: true };
            if (popupTab.width) {
                let deltaWidth = width - popupTab.width;
                updateInfo.left = left - Math.round(deltaWidth / 2);
                updateInfo.width = width + deltaWidth;
            }
            if (popupTab.height) {
                let deltaHeight = height - popupTab.height;
                updateInfo.top = top - Math.round(deltaHeight / 2);
                updateInfo.height = height + deltaHeight;
            }
            chrome.windows.update(popupWindow.id, updateInfo);
        });
    }
    showError(message) {
        let a = alert;
        a(message);
    }
    showNotification(message, title) {
        if (this.lastNotificationId) {
            chrome.notifications.clear(this.lastNotificationId, () => { });
        }
        title = title || 'TMetric';
        let type = 'basic';
        let iconUrl = 'images/icon80.png';
        chrome.notifications.create(null, { title, message, type, iconUrl }, id => this.lastNotificationId = id);
    }
    onTabMessage(message, tabId) {
        this.sendToTabs({ action: message.action + '_callback' }, tabId);
        switch (message.action) {
            case 'getConstants':
                this.sendToTabs({ action: 'setConstants', data: this._constants }, tabId);
                break;
            case 'getTimer':
                this.sendToTabs({ action: 'setTimer', data: this._timer }, tabId);
                break;
            case 'putTimer':
                this.putExternalTimer(message.data, tabId);
                break;
            case 'getIssuesDurations':
                this.getIssuesDurations(message.data).then(durations => {
                    if (this.extraHours && this._timer && this._timer.isStarted) {
                        let activeDetails = this._timer.details;
                        if (activeDetails && activeDetails.projectTask) {
                            let activeTask = activeDetails.projectTask;
                            for (let i = 0; i < durations.length; i++) {
                                let duration = durations[i];
                                if (duration.issueUrl == activeTask.relativeIssueUrl && duration.serviceUrl == activeTask.integrationUrl) {
                                    duration = JSON.parse(JSON.stringify(duration));
                                    duration.duration += this.extraHours * 3600000;
                                    durations[i] = duration;
                                    break;
                                }
                            }
                        }
                    }
                    this.sendToTabs({ action: 'setIssuesDurations', data: durations }, tabId);
                });
                break;
        }
    }
    getSettings() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get({ showPopup: 0 }, resolve);
        });
    }
    getProject(projectId, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            accountId = accountId || this._userProfile.activeAccountId;
            let scope = yield this.getAccountScope(accountId);
            if (scope) {
                return scope.projects.find(_ => _.projectId == projectId);
            }
        });
    }
    openTrackerPage() {
        let url = this.serviceUrl;
        if (this._userProfile && this._userProfile.activeAccountId) {
            url += '#/tracker/' + this._userProfile.activeAccountId + '/';
        }
        this.openPage(url);
    }
    fixTimer() {
        this.showNotification('You should fix the timer.');
        this.openTrackerPage();
    }
    putTimerWithIntegration(timer, status, requiredFields) {
        let notification;
        if (timer.projectName) {
            const contactAdmin = 'Please contact the account administrator to fix the problem.';
            if (status.projectStatus == null) {
                if (status.serviceRole != 2 &&
                    status.serviceRole != 3 &&
                    !status.canAddProject) {
                    timer.projectName = undefined;
                }
            }
            else if (status.projectStatus != 1) {
                let statusText = status.projectStatus == 3 ? 'archived' : 'done';
                notification = `Project '${timer.projectName}' exists, but it has '${statusText}' status. You cannot log time to this project.\n\n${contactAdmin}`;
                timer.projectName = undefined;
            }
            else if (status.projectRole == null) {
                notification = `Project '${timer.projectName}' exists, but you don't have access to the project.\n\n${contactAdmin}`;
                timer.projectName = undefined;
            }
            if (requiredFields.project && notification) {
                this.showNotification(notification);
                return;
            }
        }
        let promise = this.connection.setAccountToPost(status.accountId);
        if (!timer.serviceUrl != !status.integrationType ||
            !timer.projectName != !status.projectStatus) {
            promise = promise.then(() => this.connection.postIntegration({
                serviceUrl: timer.serviceUrl,
                serviceType: timer.serviceType,
                projectName: timer.projectName,
                showIssueId: timer.showIssueId
            }));
        }
        promise = promise
            .then(() => {
            return this.connection.putIssueTimer(timer);
        })
            .then(() => {
            if (notification) {
                this.showNotification(notification);
            }
        })
            .catch(status => {
            this.showError(this.getErrorText(status));
        })
            .then(() => {
            this.connection.setAccountToPost(null);
        });
        return promise;
    }
    getIntegrationStatus(timer, accountId) {
        return this.connection.getIntegration({
            serviceUrl: timer.serviceUrl,
            serviceType: timer.serviceType,
            projectName: timer.projectName,
            showIssueId: !!timer.showIssueId
        }, accountId, !!accountId);
    }
    putExternalTimer(timer, tabId, accountIdToPut = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let settings = yield this.getSettings();
            if (!timer.isStarted) {
                timer = { isStarted: false };
            }
            this.putData(timer, timer => {
                let status;
                let scopePromise = this.getIntegrationStatus(timer, accountIdToPut).then(s => {
                    status = s;
                    return this.getAccountScope(status.accountId);
                });
                scopePromise.catch(() => {
                    this.connection.checkProfileChange();
                });
                return scopePromise.then((scope) => __awaiter(this, void 0, void 0, function* () {
                    if (accountIdToPut) {
                        return this.putTimerWithIntegration(timer, status, scope.requiredFields);
                    }
                    if (timer.isStarted) {
                        yield this.validateTimerTags(timer, status.accountId);
                        const matchedProjectCount = this.getTrackedProjects(scope).filter(p => p.projectName == timer.projectName).length;
                        const requiredFields = scope.requiredFields;
                        let showPopup = settings.showPopup || 0;
                        if (requiredFields.taskLink && !timer.issueUrl) {
                            showPopup = 2;
                        }
                        else if (requiredFields.description && !timer.issueName && !timer.description ||
                            requiredFields.project && !matchedProjectCount ||
                            requiredFields.tags && (!timer.tagNames || !timer.tagNames.length)) {
                            showPopup = 0;
                        }
                        if (showPopup != 2) {
                            if (showPopup == 0 ||
                                !timer.projectName ||
                                status.projectStatus == null ||
                                matchedProjectCount > 1) {
                                if (status.projectStatus != null &&
                                    status.projectStatus != 1) {
                                    timer.projectId = 0;
                                    timer.projectName = '';
                                }
                                this._newPopupIssue = timer;
                                this._newPopupAccountId = status.accountId;
                                return this.sendToTabs({ action: 'showPopup' }, tabId);
                            }
                        }
                    }
                    return this.putTimerWithIntegration(timer, status, scope.requiredFields);
                }));
            });
        });
    }
    putData(data, action, retryAction) {
        let onFail = (status, showDialog) => {
            this._actionOnConnect = null;
            if (!status || status.statusCode == 401 || status.statusCode == 0) {
                let disconnectPromise = this.connection.disconnect();
                if (showDialog) {
                    disconnectPromise.then(() => {
                        this._actionOnConnect = () => onConnect(false);
                        this.showLoginDialog();
                    });
                }
            }
            else {
                let error = this.getErrorText(status);
                if (status.statusCode == 403 && retryAction) {
                    let promise = retryAction(data);
                    if (promise) {
                        promise.catch(() => this.showError(error));
                        return;
                    }
                }
                this.showError(error);
            }
        };
        let onConnect = (showDialog) => {
            if (this.buttonState == 2) {
                this._actionOnConnect = () => this.fixTimer();
                this.connection.getTimer().catch(status => onFail(status, showDialog));
                return;
            }
            action(data).catch(status => onFail(status, showDialog));
        };
        if (this._timer == null) {
            this._actionOnConnect = () => onConnect(true);
            this.connection.reconnect().catch(status => onFail(status, true));
        }
        else {
            onConnect(true);
        }
    }
    updateState() {
        let state = 3;
        let text = 'Not Connected';
        if (this._timer) {
            let todayTotal = 'Today Total - '
                + this.durationToString(this.getDuration(this._timeEntries))
                + ' hours';
            if (this._timer.isStarted) {
                if (this.getDuration(this._timer) > this._constants.maxTimerHours * 60 * 60000) {
                    state = 2;
                    text = 'Started\nYou need to fix long-running timer';
                }
                else {
                    state = 1;
                    let description = this._timer.details.description || '(No task description)';
                    text = `Started (${todayTotal})\n${description}`;
                }
            }
            else {
                state = 0;
                text = 'Paused\n' + todayTotal;
            }
        }
        this.buttonState = state;
        this.setButtonIcon(state == 1 || state == 2 ? 'active' : 'inactive', text);
    }
    getLoginUrl() {
        return this.serviceUrl + 'login';
    }
    normalizeUrlLastSlash(url) {
        if (url[url.length - 1] != '/') {
            url += '/';
        }
        return url;
    }
    normalizeUrl(url) {
        if (url) {
            let i = url.indexOf('#');
            if (i > 0) {
                url = url.substring(0, i);
            }
        }
        return url;
    }
    getTabIssue(url, title) {
        return { issueName: title || this.normalizeUrl(url) };
    }
    getDuration(arg) {
        if (arg) {
            let now = new Date().getTime();
            if (arg.reduce) {
                return arg.reduce((duration, entry) => {
                    let startTime = Date.parse(entry.startTime);
                    let endTime = entry.endTime ? Date.parse(entry.endTime) : now;
                    return duration + (endTime - startTime);
                }, 0);
            }
            else if (arg.isStarted) {
                return now - Date.parse(arg.startTime);
            }
        }
        return 0;
    }
    durationToString(duration) {
        let sign = '';
        if (duration < 0) {
            duration = -duration;
            sign = '-';
        }
        let totalMinutes = Math.floor(duration / 60000);
        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;
        return sign + hours + (minutes < 10 ? ':0' : ':') + minutes;
    }
    getErrorText(status) {
        let result = status && (status.responseMessage || status.statusText || status.statusCode);
        if (result) {
            return result.toString();
        }
        return 'Connection to the server failed or was aborted.';
    }
    validateTimerTags(timer, accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            accountId = accountId || this._userProfile.activeAccountId;
            let scope = yield this.getAccountScope(accountId);
            let hasWorkType = false;
            let tagByName = {};
            scope.tags.forEach(tag => {
                tagByName[tag.tagName.toLowerCase()] = tag;
            });
            timer.tagNames = (timer.tagNames || [])
                .map(name => {
                let tag = tagByName[name.toLowerCase()];
                if (!tag) {
                    return name;
                }
                if (tag.isWorkType) {
                    if (hasWorkType) {
                        return null;
                    }
                    hasWorkType = true;
                }
                return tag.tagName;
            })
                .filter(name => !!name);
            if (!hasWorkType) {
                let defaultWorkType = yield this.getDefaultWorkType(accountId);
                if (defaultWorkType) {
                    timer.tagNames.push(defaultWorkType.tagName);
                }
            }
        });
    }
    getDefaultWorkType(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            accountId = accountId || this._userProfile.activeAccountId;
            let scope = yield this.getAccountScope(accountId);
            let member = this._userProfile.accountMembership.find(_ => _.account.accountId == accountId);
            return scope.tags.find(tag => tag.tagId == member.defaultWorkTypeId);
        });
    }
    getRecentTasks(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connection.getRecentWorkTasks(accountId || this._userProfile.activeAccountId);
        });
    }
    makeIssueDurationKey(identifier) {
        return identifier.serviceUrl + '/' + identifier.issueUrl;
    }
    getIssueDurationFromCache(identifier) {
        return this._issuesDurationsCache[this.makeIssueDurationKey(identifier)];
    }
    putIssuesDurationsToCache(durations) {
        durations.forEach(duration => {
            this._issuesDurationsCache[this.makeIssueDurationKey(duration)] = duration;
        });
    }
    removeIssuesDurationsFromCache(identifiers) {
        identifiers.forEach(identifier => {
            delete this._issuesDurationsCache[this.makeIssueDurationKey(identifier)];
        });
    }
    clearIssuesDurationsCache() {
        this._issuesDurationsCache = {};
    }
    getIssuesDurations(identifiers) {
        let durations = [];
        let fetchIdentifiers = [];
        identifiers = identifiers.filter(_ => !!_.serviceUrl && !!_.issueUrl);
        identifiers.forEach(identifier => {
            let duration = this.getIssueDurationFromCache(identifier);
            if (duration) {
                durations.push(duration);
            }
            else {
                fetchIdentifiers.push(identifier);
            }
        });
        if (durations.length == identifiers.length) {
            return Promise.resolve(durations);
        }
        return new Promise(resolve => {
            this.connection.fetchIssuesDurations(fetchIdentifiers)
                .then(fetchDurations => {
                this.putIssuesDurationsToCache(fetchDurations);
                resolve(durations.concat(fetchDurations));
            })
                .catch(() => {
                resolve([]);
            });
        });
    }
    invalidateAccountScopeCache(accountId) {
        delete this._accountScopeCache[accountId];
    }
    getAccountScope(accountId) {
        let scope = this._accountScopeCache[accountId];
        if (!scope) {
            scope = this._accountScopeCache[accountId] = this.connection.getAccountScope(accountId)
                .then(scope => {
                scope.requiredFields = scope.requiredFields || {};
                return scope;
            });
        }
        return scope;
    }
    listenPopupAction(action, handler) {
        this._popupActions[action] = handler;
    }
    onPopupRequest(request, callback) {
        let action = request.action;
        let handler = this._popupActions[action];
        if (action && handler) {
            handler.call(this, request.data).then((result) => {
                callback({ action: action, data: result });
            }).catch((error) => {
                callback({ action: action, error: error || 'Error' });
            });
        }
        else {
            callback({ action: action, error: 'Not found handler for action ' + action });
        }
    }
    getPopupData(params) {
        return __awaiter(this, void 0, void 0, function* () {
            let accountId = params.accountId;
            if (!accountId && this._newPopupAccountId) {
                accountId = this._newPopupAccountId;
            }
            if (!this._userProfile.accountMembership.some(_ => _.account.accountId == accountId)) {
                accountId = this._userProfile.activeAccountId;
            }
            return Promise.all([
                this.getActiveTabTitle(),
                this.getAccountScope(accountId),
                this.getDefaultWorkType(accountId)
            ]).then(([title, scope, defaultWorkType]) => {
                let userRole = this._userProfile.accountMembership
                    .find(_ => _.account.accountId == accountId)
                    .role;
                let canMembersManagePublicProjects = scope.account.canMembersManagePublicProjects;
                let canCreateTags = scope.account.canMembersCreateTags;
                let isAdmin = (userRole == 2 || userRole == 3);
                let newIssue = this._newPopupIssue || {
                    isStarted: true,
                    description: title,
                    tagNames: defaultWorkType ? [defaultWorkType.tagName] : []
                };
                let filteredProjects = this.getTrackedProjects(scope)
                    .sort((a, b) => a.projectName.localeCompare(b.projectName, [], { sensitivity: 'base' }));
                const projectMap = this.getProjectMap(accountId);
                let defaultProjectId = null;
                if (projectMap) {
                    defaultProjectId = projectMap[newIssue.projectName || ''];
                    if (defaultProjectId && filteredProjects.every(_ => _.projectId != defaultProjectId)) {
                        this.setProjectMap(accountId, newIssue.projectName, null);
                        defaultProjectId = null;
                    }
                }
                const descriptionMap = this.getDescriptionMap();
                if (newIssue.issueId && !newIssue.description && descriptionMap) {
                    newIssue.description = descriptionMap[newIssue.issueName];
                }
                this._newPopupIssue = null;
                this._newPopupAccountId = null;
                return {
                    timer: this._timer,
                    newIssue,
                    profile: this._userProfile,
                    accountId,
                    projects: filteredProjects,
                    clients: scope.clients,
                    tags: scope.tags,
                    canCreateProjects: isAdmin || canMembersManagePublicProjects,
                    canCreateTags,
                    constants: this._constants,
                    defaultProjectId,
                    requiredFields: scope.requiredFields
                };
            });
        });
    }
    initializePopupAction(params) {
        return new Promise((resolve, reject) => {
            this._actionOnConnect = null;
            if (this._timer) {
                resolve(this.getPopupData(params));
            }
            else {
                reject('Not connected');
            }
        });
    }
    openTrackerPagePopupAction() {
        return Promise.resolve(null).then(() => {
            this.openTrackerPage();
        });
    }
    openPagePopupAction(url) {
        return Promise.resolve(null).then(() => {
            this.openPage(url);
        });
    }
    isConnectionRetryEnabledPopupAction() {
        return this.connection.isConnectionRetryEnabled();
    }
    retryConnectionPopupAction() {
        return this.connection.retryConnection();
    }
    showLoginDialog() {
        if (this.loginWinId) {
            chrome.windows.update(this.loginWinId, { focused: true });
            return;
        }
        chrome.windows.getLastFocused(pageWindow => {
            if (this.loginWindowPending) {
                return;
            }
            this.loginWindowPending = true;
            try {
                let { width, height, left, top } = this.getDefaultLoginPosition();
                if (pageWindow.left != null && pageWindow.width != null) {
                    left = Math.round(pageWindow.left + (pageWindow.width - width) / 2);
                }
                if (pageWindow.top != null && pageWindow.height != null) {
                    top = Math.round(pageWindow.top + (pageWindow.height - height) / 2);
                }
                this.createLoginDialog(width, height, left, top);
            }
            catch (e) {
                this.loginWindowPending = false;
            }
        });
    }
    loginPopupAction() {
        return Promise.resolve(null).then(() => {
            this.connection.reconnect().catch(() => this.showLoginDialog());
        });
    }
    fixTimerPopupAction() {
        return Promise.resolve(null).then(() => {
            this.openTrackerPage();
        });
    }
    putTimerPopupAction(timer) {
        return Promise.resolve(null).then(() => this.putData(timer, timer => this.connection.putTimer(timer)));
    }
    setButtonIcon(icon, tooltip) {
        chrome.browserAction.setIcon({
            path: {
                '19': 'images/' + icon + '19.png',
                '38': 'images/' + icon + '38.png'
            }
        });
        chrome.browserAction.setTitle({ title: tooltip });
    }
    sendToTabs(message, tabId) {
        if (tabId != null) {
            chrome.tabs.sendMessage(tabId, message);
            return;
        }
        chrome.tabs.query({}, tabs => tabs && tabs.forEach(tab => {
            if (tab.url && tab.url.startsWith('http')) {
                chrome.tabs.sendMessage(tab.id, message, response => {
                    let error = chrome.runtime.lastError;
                    if (error) {
                        void 0;
                    }
                });
            }
        }));
    }
    getTestValue(name) {
        return localStorage.getItem(name);
    }
    getActiveTabTitle() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                let activeTab = tabs && tabs[0];
                let title = activeTab && activeTab.title;
                resolve(title);
            });
        });
    }
    getActiveTabId() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
                let activeTab = tabs && tabs[0];
                let id = activeTab && activeTab.id;
                resolve(id);
            });
        });
    }
    openPage(url) {
        chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, tabs => {
            let currentWindowId = tabs && tabs.length && tabs[0].windowId;
            chrome.tabs.query({ url: url.split('#')[0] + '*' }, tabs => {
                let pageTabs = tabs && tabs.filter(tab => tab.url == url);
                if (pageTabs && pageTabs.length) {
                    let anyWindowTab, anyWindowActiveTab, currentWindowTab, currentWindowActiveTab;
                    for (let index = 0, size = pageTabs.length; index < size; index += 1) {
                        anyWindowTab = pageTabs[index];
                        if (anyWindowTab.active) {
                            anyWindowActiveTab = anyWindowTab;
                        }
                        if (anyWindowTab.windowId == currentWindowId) {
                            currentWindowTab = anyWindowTab;
                            if (currentWindowTab.active) {
                                currentWindowActiveTab = currentWindowTab;
                            }
                        }
                    }
                    let tabToActivate = currentWindowActiveTab || currentWindowTab || anyWindowActiveTab || anyWindowTab;
                    chrome.windows.update(tabToActivate.windowId, { focused: true });
                    chrome.tabs.update(tabToActivate.id, { active: true });
                }
                else {
                    chrome.tabs.create({ active: true, windowId: currentWindowId, url });
                }
            });
        });
    }
    registerTabsUpdateListener() {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (tabId == this.loginTabId && changeInfo.url) {
                let tabUrl = changeInfo.url.toLowerCase();
                let serviceUrl = this.serviceUrl.toLowerCase();
                if (tabUrl == serviceUrl || tabUrl.indexOf(serviceUrl + '#') == 0) {
                    chrome.tabs.remove(tabId);
                    return;
                }
            }
        });
    }
    registerTabsRemoveListener() {
        chrome.tabs.onRemoved.addListener((tabId) => {
            if (tabId == this.loginTabId) {
                this.loginTabId = null;
                this.loginWinId = null;
                this.connection.reconnect();
            }
        });
    }
    registerMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, senderResponse) => {
            if (!sender.url || sender.url.startsWith(this._constants.browserSchema)) {
                this.onPopupRequest(message, senderResponse);
                return !!senderResponse;
            }
            if (!sender.tab) {
                return;
            }
            if (sender.tab.id == this.loginTabId) {
                return;
            }
            let tabId = sender.tab.id;
            this.onTabMessage(message, tabId);
            senderResponse(null);
        });
    }
    setProjectMap(accountId, projectName, projectId) {
        let map = this.getProjectMap(accountId);
        if (projectId) {
            map = map || {};
            map[projectName] = projectId;
            this.accountToProjectMap[accountId] = map;
        }
        else if (map) {
            delete map[projectName];
        }
        localStorage.setItem(this.accountToProjectMapKey, JSON.stringify(this.accountToProjectMap));
    }
    getProjectMap(accountId) {
        if (!this.accountToProjectMap) {
            const obj = localStorage.getItem(this.accountToProjectMapKey);
            this.accountToProjectMap = obj ? JSON.parse(obj) : {};
        }
        return this.accountToProjectMap[accountId];
    }
    setDescriptionMap(taskName, description) {
        let map = this.getDescriptionMap();
        if (description && description != taskName) {
            map = map || {};
            map[taskName] = description;
            this.taskNameToDescriptionMap = map;
        }
        else {
            delete map[taskName];
        }
        localStorage.setItem(this.taskNameToDescriptionMapKey, JSON.stringify(this.taskNameToDescriptionMap));
    }
    getDescriptionMap() {
        if (!this.taskNameToDescriptionMap) {
            const obj = localStorage.getItem(this.taskNameToDescriptionMapKey);
            this.taskNameToDescriptionMap = obj ? JSON.parse(obj) : {};
        }
        return this.taskNameToDescriptionMap;
    }
    getTrackedProjects(scope) {
        const trackedProjectsMap = {};
        scope.trackedProjects.forEach(tp => trackedProjectsMap[tp] = true);
        return scope.projects.filter(p => trackedProjectsMap[p.projectId]);
    }
    getRecentTasksAction(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            let [recentTasks, scope] = yield Promise.all([
                this.getRecentTasks(accountId),
                this.getAccountScope(accountId)
            ]);
            let trackedProjectsMap = {};
            scope.trackedProjects.forEach(tp => trackedProjectsMap[tp] = true);
            return recentTasks ? recentTasks.filter(t => !t.details.projectId || trackedProjectsMap[t.details.projectId]).slice(0, 25) : null;
        });
    }
}
