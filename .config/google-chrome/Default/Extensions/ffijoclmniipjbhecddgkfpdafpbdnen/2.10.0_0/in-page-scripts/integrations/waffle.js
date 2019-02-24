class Waffle {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = '*://waffle.io/*/*/cards/*';
        this.issueElementSelector = '.modal-dialog';
    }
    render(issueElement, linkElement) {
        var host = $$('.discussion-status', issueElement);
        if (host) {
            var linkContainer = $$.create('div');
            linkContainer.appendChild(linkElement);
            host.appendChild(linkContainer);
        }
    }
    getIssue(issueElement, source) {
        var serviceType = 'GitHub';
        var serviceUrl = 'https://github.com';
        var issueNumberElement = $$.try('.issue-number', issueElement);
        var issueUrlElement = $$.closest('a', issueNumberElement);
        if (!issueUrlElement) {
            return;
        }
        var issueUrl = $$.getRelativeUrl(serviceUrl, issueUrlElement.href);
        var issueIdPrefix = /^.*\/pull\/\d+$/.test(issueUrl) ? '!' : '#';
        var issueId = issueNumberElement.textContent;
        if (!issueId) {
            return;
        }
        issueId = issueIdPrefix + issueId;
        var issueName = $$.try('.issue-title', issueElement).textContent;
        if (!issueName) {
            return;
        }
        var projectName = $$.try('.project-dropdown .dropdown-title').textContent;
        if (projectName) {
            projectName = projectName.split('/')[1];
        }
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new Waffle());
