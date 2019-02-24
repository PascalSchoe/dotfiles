class Userecho {
    constructor() {
        this.showIssueId = false;
        this.matchUrl = ['*://*.userecho.com*/topics/*'];
    }
    render(issueElement, linkElement) {
        var host = $$('.topic-actions-panel');
        if (host) {
            var container = $$.create('li');
            container.appendChild(linkElement);
            host.insertBefore(container, host.firstChild);
        }
    }
    getIssue(issueElement, source) {
        var issue = $$.try('.topic-header a');
        let issueName = issue.textContent;
        let issueHref = issue.getAttribute('href');
        var match = /\/topics\/([\d]*)\-.*\//.exec(issueHref);
        if (!match) {
            return;
        }
        var issueId = match[1];
        var serviceUrl = source.protocol + source.host;
        var issueUrl = '/topics/' + issueId;
        var projectName = $$.try('.navbar-brand').textContent;
        return { issueId, issueName, issueUrl, projectName, serviceUrl, serviceType: 'Userecho' };
    }
}
IntegrationService.register(new Userecho());
