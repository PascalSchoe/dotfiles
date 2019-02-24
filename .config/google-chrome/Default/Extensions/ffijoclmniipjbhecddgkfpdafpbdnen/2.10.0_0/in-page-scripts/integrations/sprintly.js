class Sprintly {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = '*://sprint.ly/*';
        this.issueElementSelector = '.card';
    }
    render(issueElement, linkElement) {
        if ($$.closest('#product-item-view', issueElement)) {
            let host = $$('.actions .buttons', issueElement);
            if (host) {
                host.appendChild(linkElement);
                return;
            }
        }
        let host = $$('.settings .popup ul', issueElement);
        if (host) {
            let li = $$.create('li', 'devart-timer-link-sprintly');
            li.appendChild(linkElement);
            host.insertBefore(li, host.firstChild);
        }
    }
    getIssue(issueElement, source) {
        var issueName = $$.try('.title', issueElement).textContent;
        if (!issueName) {
            return;
        }
        var projectNameElement = $$('a.products');
        if (projectNameElement) {
            var projectName = projectNameElement.textContent;
            var projectUrl = projectNameElement.getAttribute('href');
        }
        var serviceType = 'Sprintly';
        var issueNumberElement = $$('.number .value', issueElement);
        if (issueNumberElement) {
            var issueId = issueNumberElement.textContent;
            if (projectUrl) {
                var match = /^([^\d]*)(\d+)$/.exec(issueNumberElement.textContent);
                if (match) {
                    var issueUrl = projectUrl + 'item/' + match[2];
                    var serviceUrl = source.protocol + source.host;
                }
            }
        }
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new Sprintly());
