class Clickup {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = '*://app.clickup.com';
        this.issueElementSelector = [
            '.task',
            '.lv-subtask__outer',
            '.checklist-todo-item'
        ];
    }
    render(issueElement, linkElement) {
        linkElement.classList.add('devart-timer-link-clickup');
        if (issueElement.matches(this.issueElementSelector[0])) {
            let element = $$('.task__toolbar:nth-last-of-type(1)', issueElement);
            if (element) {
                element.insertBefore(linkElement, element.firstElementChild.nextElementSibling);
            }
        }
        else if (issueElement.matches(this.issueElementSelector[1])) {
            linkElement.classList.add('devart-timer-link-minimal');
            let element = $$('.task-todo-item__name-text', issueElement);
            if (element) {
                element.parentElement.insertBefore(linkElement, element.nextElementSibling);
            }
        }
        else if (issueElement.matches(this.issueElementSelector[2])) {
            linkElement.classList.add('devart-timer-link-minimal');
            let element = $$('.checklist-item__name-block', issueElement);
            if (element) {
                element.parentElement.insertBefore(linkElement, element.nextElementSibling);
            }
        }
    }
    getIssue(issueElement, source) {
        let serviceType = 'ClickUp';
        let serviceUrl = source.protocol + source.host;
        let issueId;
        let issueUrl;
        let matches = source.fullUrl.match(/\/t\/([^\/]+)$/);
        if (matches) {
            issueId = matches[1];
            issueUrl = '/t/' + issueId;
        }
        let issueName = $$.try('.task-name__overlay').textContent;
        let description;
        if (issueElement.matches(this.issueElementSelector[1])) {
            let subtaskLink = $$('.task-todo-item__name-text a', issueElement);
            if (subtaskLink) {
                let matches = subtaskLink.href.match(/\/t\/([^\/]+)$/);
                if (matches) {
                    issueName = subtaskLink.textContent;
                    issueId = matches[1];
                    issueUrl = '/t/' + issueId;
                }
            }
        }
        else if (issueElement.matches(this.issueElementSelector[2])) {
            description = $$.try('.checklist-item__name', issueElement).textContent;
        }
        let projectName = $$.try('.breadcrumbs__link[data-category]').textContent;
        return { serviceType, serviceUrl, issueId, issueName, issueUrl, description, projectName };
    }
}
IntegrationService.register(new Clickup());
