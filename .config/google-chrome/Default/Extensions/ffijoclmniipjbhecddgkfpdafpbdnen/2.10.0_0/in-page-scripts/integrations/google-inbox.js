class GoogleInbox {
    constructor() {
        this.showIssueId = false;
        this.matchUrl = '*://inbox.google.com*';
        this.observeMutations = true;
    }
    render(issueElement, linkElement) {
        let toolbar = $$('.bJ .iK');
        if (toolbar) {
            let menuItem = $$.create('li', 'action', 'devart-timer-link-google-inbox');
            menuItem.appendChild(linkElement);
            toolbar.insertBefore(menuItem, toolbar.firstElementChild);
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('.eo > span').textContent;
        return { issueName };
    }
}
IntegrationService.register(new GoogleInbox());
