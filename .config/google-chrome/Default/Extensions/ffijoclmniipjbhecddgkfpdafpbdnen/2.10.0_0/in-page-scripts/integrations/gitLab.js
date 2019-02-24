class GitLab {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = [
            '*://*/issues/*',
            '*://*/merge_requests/*'
        ];
    }
    match(source) {
        return !!$$('.detail-page-description .title');
    }
    render(issueElement, linkElement) {
        linkElement.classList.add('btn');
        let header = $$('.detail-page-header');
        if (!header) {
            return;
        }
        let issueButton = $$.visible('.js-issuable-actions', header);
        if (issueButton) {
            linkElement.classList.add('btn-grouped');
            issueButton.parentElement.insertBefore(linkElement, issueButton);
            return;
        }
        let buttons = $$('.issue-btn-group', header);
        if (buttons) {
            linkElement.classList.add('btn-grouped');
            buttons.appendChild(linkElement);
        }
        else {
            linkElement.style.marginLeft = '1em';
            header.appendChild(linkElement);
        }
    }
    getIssue(issueElement, source) {
        let match = /^(.+)\/(issues|merge_requests)\/(\d+)$/.exec(source.path);
        if (!match) {
            return;
        }
        let issueId = match[3];
        if (!issueId) {
            return;
        }
        let issueType = match[2];
        issueId = (issueType == 'merge_requests' ? '!' : '#') + issueId;
        let issueNameElement = $$.try('.detail-page-description .title');
        let issueName = issueNameElement.firstChild ? issueNameElement.firstChild.textContent : issueNameElement.textContent;
        if (!issueName) {
            return;
        }
        let projectNameNode = $$.findNode('.title .project-item-select-holder', Node.TEXT_NODE);
        let projectName = projectNameNode ?
            projectNameNode.textContent :
            ($$.try('.context-header .sidebar-context-title').textContent
                || $$.try('.title > span > a:nth-last-child(2)').textContent);
        let serviceType = 'GitLab';
        let serviceUrl = $$('a#logo').href;
        if (!serviceUrl || !source.fullUrl.startsWith(serviceUrl)) {
            serviceUrl = source.protocol + source.host;
        }
        let issueUrl = $$.getRelativeUrl(serviceUrl, source.fullUrl);
        var tagNames = $$.all('.labels .label').map(label => label.textContent);
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl, tagNames };
    }
}
class GitLabSidebar {
    constructor() {
        this.showIssueId = true;
        this.matchUrl = /(.*)\/boards/;
        this.observeMutations = true;
    }
    get isSidebarOpen() {
        return !!$$.visible('.right-sidebar');
    }
    render(issueElement, linkElement) {
        if (!this.isSidebarOpen) {
            return;
        }
        let div = document.createElement('div');
        linkElement.classList.add('btn', 'btn-default');
        div.appendChild(linkElement);
        $$('.issuable-sidebar-header .issuable-header-text').appendChild(div);
    }
    getIssue(issueElement, source) {
        if (!this.isSidebarOpen) {
            return;
        }
        let issueName = $$.try('.issuable-header-text > strong').textContent;
        let projectName = $$.try('.sidebar-context-title').textContent;
        let serviceType = 'GitLab';
        let serviceUrl = $$('a#logo').href;
        if (!serviceUrl || !source.fullUrl.startsWith(serviceUrl)) {
            serviceUrl = source.protocol + source.host;
        }
        let issueFullId = $$.try('.issuable-header-text > span').textContent;
        let issueUrl;
        let issueId;
        let projectId;
        let idMatch = issueFullId && issueFullId.match(/\s*(.*)#(\d+)\s*/);
        if (idMatch) {
            projectId = idMatch[1];
            issueId = idMatch[2];
            issueUrl = $$.getRelativeUrl(serviceUrl, source.fullUrl.match(this.matchUrl)[1]);
            let groupIssueMatch = issueUrl.match(/\/groups\/(.+)\/-/);
            if (groupIssueMatch) {
                if (projectId) {
                    issueUrl = `/${groupIssueMatch[1]}/${projectId}`;
                }
                else {
                    issueId = null;
                    issueUrl = null;
                }
            }
            if (issueId) {
                issueUrl += `/issues/${issueId}`;
                issueId = '#' + issueId;
            }
        }
        let tagNames = $$.all('.issuable-show-labels > a span').map(label => label.textContent);
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl, tagNames };
    }
}
IntegrationService.register(new GitLab(), new GitLabSidebar());
