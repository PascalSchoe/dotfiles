class Trello {
    constructor() {
        this.showIssueId = true;
        this.matchUrl = '*://trello.com/c/*';
        this.issueElementSelector = [
            '.js-plugin-buttons ~ .window-module > div',
            '.checklist-item-details'
        ];
        this.observeMutations = true;
    }
    render(issueElement, linkElement) {
        if (issueElement.matches(this.issueElementSelector[0])) {
            let text = linkElement.lastElementChild.textContent;
            if (/[0-9]/.test(text)) {
                linkElement.lastElementChild.textContent = text.replace(' timer', '');
            }
            linkElement.classList.add('trello');
            linkElement.classList.add('button-link');
            issueElement.insertBefore(linkElement, issueElement.firstElementChild);
        }
        else if (issueElement.matches(this.issueElementSelector[1])) {
            linkElement.classList.add('devart-timer-link-minimal', 'devart-timer-link-trello');
            issueElement.insertBefore(linkElement, issueElement.nextElementSibling);
        }
    }
    getIssue(issueElement, source) {
        var match = /^\/c\/(.+)\/(\d+)-(.+)$/.exec(source.path);
        if (!match) {
            return;
        }
        var issueId = match[2];
        if (!issueId) {
            return;
        }
        issueId = '#' + issueId;
        var issueName = $$.try('.window-title h2').textContent;
        if (!issueName) {
            return;
        }
        var projectName = $$.try('.board-header-btn-name > .board-header-btn-text').textContent;
        var serviceUrl = source.protocol + source.host;
        var issueUrl = '/c/' + match[1];
        var tagNames = $$.all('.js-card-detail-labels-list .card-label').map(label => label.textContent);
        let description;
        if (issueElement.matches(this.issueElementSelector[1])) {
            description = $$.try('.checklist-item-details-text', issueElement).textContent;
        }
        return { issueId, issueName, projectName, serviceType: 'Trello', serviceUrl, issueUrl, tagNames, description };
    }
}
IntegrationService.register(new Trello());
