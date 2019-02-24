class Bitbucket {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = [
            '*://*/issues/*',
            '*://*/pull-requests/*'
        ];
    }
    match() {
        return $$.getAttribute('meta[name=application-name]', 'content') == 'Bitbucket';
    }
    render(issueElement, linkElement) {
        var issueHeader = $$('#issue-header');
        var pullRequestHeader = $$('#pull-request-header');
        var actionContainer;
        if (issueHeader) {
            actionContainer = $$('.issue-toolbar', issueHeader);
        }
        else if (pullRequestHeader) {
            actionContainer = $$('#pullrequest-actions', pullRequestHeader);
        }
        if (actionContainer) {
            var linkContainer = $$.create('div', 'devart-timer-link-bitbucket', 'aui-buttons');
            linkElement.classList.add('aui-button');
            linkContainer.appendChild(linkElement);
            actionContainer.insertBefore(linkContainer, actionContainer.firstElementChild);
        }
    }
    getIssue(issueElement, source) {
        var match = /^(.+)\/(issues|pull-requests)\/(\d+).*$/.exec(source.path);
        if (!match) {
            return;
        }
        var issueNumber = match[3];
        if (!issueNumber) {
            return;
        }
        var issueId, issueName;
        var issueType = match[2];
        if (issueType == 'issues') {
            issueId = '#' + issueNumber;
            issueName = $$.try('#issue-title').textContent;
        }
        else if (issueType == 'pull-requests') {
            issueId = '!' + issueNumber;
            issueName = $$.try('.pull-request-title').textContent;
        }
        if (!issueName) {
            return;
        }
        var projectName = $$.try('.aui-nav-selected a', null, el => /.+\/projects\/.+/.test(el.getAttribute('href'))).textContent;
        var serviceType = 'Bitbucket';
        var servicePath = match[1].split('/').slice(0, -2).join('/');
        servicePath = (servicePath) ? '/' + servicePath : '';
        var serviceUrl = source.protocol + source.host + servicePath;
        var issueUrl = match[1].split('/').slice(-2).join('/') + '/' + issueType + '/' + issueNumber;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new Bitbucket());
