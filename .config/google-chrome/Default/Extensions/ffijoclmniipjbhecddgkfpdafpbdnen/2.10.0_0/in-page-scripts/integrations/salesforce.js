class Salesforce {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = '*://*.lightning.force.com';
        this.issueElementSelector = [
            '.slds-page-header'
        ];
    }
    render(issueElement, linkElement) {
        let host = $$('.forceActionsContainer', issueElement);
        if (host) {
            linkElement.style.marginRight = '0.5rem';
            linkElement.style.alignSelf = 'center';
            host.insertBefore(linkElement, host.firstElementChild);
        }
    }
    getIssue(issueElement, source) {
        let serviceType = 'Salesforce';
        let serviceUrl = source.protocol + source.host;
        let issueName;
        let issueId;
        let issueUrl;
        let match = /\/lightning\/r\/(\w+)\/(\w+)\/view$/.exec(source.path);
        if (match) {
            issueName = $$.try('h1 .uiOutputText', issueElement).textContent;
            issueId = match[2];
        }
        if (!issueName) {
            return;
        }
        if (issueId) {
            issueUrl = `/lightning/r/${issueId}/view`;
        }
        return { serviceType, serviceUrl, issueName, issueId, issueUrl };
    }
}
IntegrationService.register(new Salesforce());
