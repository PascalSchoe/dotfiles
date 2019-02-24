class Zendesk {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = '*://*.zendesk.com/agent/tickets/*';
    }
    render(issueElement, linkElement) {
        let host = $$.visible('header .pane.right');
        if (host) {
            linkElement.classList.add('btn', 'devart-timer-link-zendesk');
            host.appendChild(linkElement);
        }
    }
    getIssue(issueElement, source) {
        var issueNameElement = $$.visible('.ticket .editable input[name=subject]');
        var issueName = issueNameElement && issueNameElement.value;
        if (!issueName) {
            return;
        }
        var match = /^\/agent\/tickets\/(\d+)$/.exec(source.path);
        if (match) {
            var issueId = '#' + match[1];
            var serviceType = 'Zendesk';
            var serviceUrl = source.protocol + source.host;
            var issueUrl = source.path;
        }
        var projectName = '';
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new Zendesk());
