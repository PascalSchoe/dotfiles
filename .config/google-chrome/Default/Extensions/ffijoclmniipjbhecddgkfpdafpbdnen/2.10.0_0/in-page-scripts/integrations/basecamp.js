class BasecampBase {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
    }
    getIssueUrl(issueElement, source) {
        return null;
    }
    render(issueElement, linkElement) {
        var host = $$(this.hostSelector, issueElement);
        if (host) {
            linkElement.classList.add('action_button', 'small', 'devart-timer-link-basecamp');
            host.appendChild(linkElement);
        }
    }
    getIssue(issueElement, source) {
        var match = /^\/(\d+)\/buckets\/(\d+)\/(todos|todosets|todolists)\/(\d+)$/.exec(source.path);
        if (!match) {
            return;
        }
        var serviceUrl = source.protocol + source.host;
        var issueUrl = this.getIssueUrl(issueElement, source);
        if (!issueUrl) {
            return;
        }
        issueUrl = $$.getRelativeUrl(serviceUrl, issueUrl);
        var issueId = issueUrl.split('/todos/')[1];
        if (!issueId) {
            return;
        }
        issueId = '#' + issueId;
        var issueName = $$.try('.todos-form__input--summary', issueElement).value ||
            $$.try('.todo h1', issueElement).textContent;
        if (!issueName) {
            return;
        }
        var projectName = $$.try('.project-header__name a').textContent;
        var serviceType = 'Basecamp';
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
class BasecampTodo extends BasecampBase {
    constructor() {
        super(...arguments);
        this.matchUrl = '*://*basecamp.com/*/buckets/*/todos/*';
        this.issueElementSelector = '.panel--perma';
        this.hostSelector = '.perma-toolbar';
    }
    getIssueUrl(issueElement, source) {
        return source.path;
    }
}
class BasecampTodos extends BasecampBase {
    constructor() {
        super(...arguments);
        this.matchUrl = [
            '*://*basecamp.com/*/buckets/*/todosets/*',
            '*://*basecamp.com/*/buckets/*/todolists/*'
        ];
        this.issueElementSelector = '.todos .edit_todo';
        this.hostSelector = '.submit';
    }
    getIssueUrl(issueElement, source) {
        return issueElement.action;
    }
}
IntegrationService.register(new BasecampTodo(), new BasecampTodos());
