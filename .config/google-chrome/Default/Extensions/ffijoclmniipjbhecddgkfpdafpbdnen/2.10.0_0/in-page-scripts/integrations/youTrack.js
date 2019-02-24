class YouTrack {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = [
            '*://*/issue/*',
            '*://*/agiles/*'
        ];
        this.issueElementSelector = '.yt-issue-view';
    }
    render(issueElement, linkElement) {
        let host = $$('.yt-issue-view__meta-information', issueElement)
            || $$('.yt-issue-toolbar', issueElement);
        if (host) {
            host.appendChild(linkElement);
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('.yt-issue-body__summary', issueElement).textContent;
        if (!issueName) {
            return;
        }
        let linkElement = $$('.yt-issue-id');
        let issueId = linkElement && linkElement.textContent;
        let issueUrl = linkElement && linkElement.getAttribute('href');
        let projectName = $$.try('yt-issue-project', issueElement).textContent;
        let serviceType = 'YouTrack';
        let serviceUrl = $$.try('base').href;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
class YouTrackOld {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = '*://*/issue/*';
        this.issueElementSelector = '.content_fsi .toolbar_fsi';
    }
    render(issueElement, linkElement) {
        issueElement.appendChild(linkElement);
    }
    getIssue(issueElement, source) {
        var match = /^(.+)\/issue\/(.+)$/.exec(source.fullUrl);
        if (!match) {
            return;
        }
        var issueId = $$.try('.issueId', issueElement).textContent;
        if (!issueId) {
            return;
        }
        var issueName = $$.try('.issue-summary', issueElement).textContent;
        if (!issueName) {
            return;
        }
        var projectName = $$.try('.fsi-properties .fsi-property .attribute.bold').textContent;
        var serviceType = 'YouTrack';
        var serviceUrl = match[1];
        var issueUrl = 'issue/' + issueId;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
class YouTrackBoardOld {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = '*://*/rest/agile/*/sprint/*';
        this.issueElementSelector = '#editIssueDialog';
    }
    render(issueElement, linkElement) {
        var host = $$('.sb-issue-edit-id', issueElement);
        if (host) {
            host.parentElement.insertBefore(linkElement, host.nextElementSibling);
        }
    }
    getIssue(issueElement, source) {
        var match = /^(.+)\/rest\/agile\/(.+)$/.exec(source.fullUrl);
        if (!match) {
            return;
        }
        var issueId = $$.try('.sb-issue-edit-id', issueElement).textContent;
        if (!issueId) {
            return;
        }
        var issueName = $$.try('.sb-issue-edit-summary input', issueElement).value ||
            $$.try('.sb-issue-edit-summary.sb-disabled', issueElement).textContent;
        if (!issueName) {
            return;
        }
        var projectSelector = $$('.sb-agile-dlg-projects');
        if (projectSelector) {
            var projectName = $$.try('label[for=editAgileProjects_' + issueId.split('-')[0] + ']', projectSelector).textContent;
        }
        var serviceType = 'YouTrack';
        var serviceUrl = match[1];
        var issueUrl = 'issue/' + issueId;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new YouTrack(), new YouTrackOld(), new YouTrackBoardOld());
