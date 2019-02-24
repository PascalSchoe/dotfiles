class GitHub {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = /(https:\/\/github\.com)(\/.+\/(issues|pull)\/(\d+))/;
    }
    render(issueElement, linkElement) {
        let host = $$('.gh-header-actions');
        if (host) {
            linkElement.style.display = 'inline-block';
            linkElement.classList.add('github');
            linkElement.classList.add('btn');
            linkElement.classList.add('btn-sm');
            host.insertBefore(linkElement, host.firstElementChild);
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('.js-issue-title').textContent;
        if (!issueName) {
            return;
        }
        let projectName = $$.try('.repohead-details-container > h1 > strong > a').textContent;
        let match = this.matchUrl.exec(source.fullUrl);
        let serviceUrl = match[1];
        let issueUrl = match[2];
        let issueType = match[3];
        let issueId = match[4];
        issueId = (issueType == 'pull' ? '!' : '#') + issueId;
        let serviceType = 'GitHub';
        let tagNames = $$.all('.discussion-sidebar .labels.css-truncate a').map(label => label.textContent);
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl, tagNames };
    }
}
IntegrationService.register(new GitHub());
