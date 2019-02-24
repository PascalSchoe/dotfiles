class Asana {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = '*://app.asana.com/*/*';
        this.issueElementSelector = [
            '.SingleTaskPane',
            '.SubtaskTaskRow'
        ];
    }
    render(issueElement, linkElement) {
        if (issueElement.matches(this.issueElementSelector[0])) {
            let linkContainer = $$.create('div', 'devart-timer-link-asana');
            linkContainer.appendChild(linkElement);
            $$('.SingleTaskTitleRow, .sticky-view-placeholder, .SingleTaskPane-titleRow', issueElement)
                .insertAdjacentElement('afterend', linkContainer);
        }
        if (issueElement.matches(this.issueElementSelector[1])) {
            let container = $$('.ItemRowTwoColumnStructure-right', issueElement);
            linkElement.classList.add('devart-timer-link-minimal', 'devart-timer-link-asana-subtask');
            container.insertBefore(linkElement, container.firstElementChild);
        }
    }
    getIssue(issueElement, source) {
        let description;
        let rootTaskPane = $$.closest('.SingleTaskPane', issueElement);
        if (!rootTaskPane) {
            return;
        }
        let issueName = $$.try('.SingleTaskTitleRow .simpleTextarea, .SingleTaskPane-titleRow .simpleTextarea', rootTaskPane).value;
        let issuePath = source.path;
        if (issueElement.matches(this.issueElementSelector[1])) {
            description = $$.try('.SubtaskTaskRow textarea', issueElement).value;
            if (!description) {
                return;
            }
            let rootTask = $$('.TaskAncestry-ancestor a', rootTaskPane);
            if (rootTask) {
                issueName = rootTask.textContent;
                let match = /:\/\/[^\/]+(\/[^\?#]+)/.exec(rootTask.href);
                if (match) {
                    issuePath = match[1];
                }
            }
        }
        let issueId;
        let issueUrl;
        let match = /^\/\w+(?:\/search)?\/\d+\/(\d+)/.exec(issuePath);
        if (match) {
            issueId = '#' + match[1];
            issueUrl = '/0/0/' + match[1];
        }
        let projectName = $$.try('.TaskProjectToken-projectName').textContent ||
            $$.try('.TaskProjectPill-projectName').textContent ||
            $$.try('.TaskAncestry-ancestorProject').textContent;
        let serviceType = 'Asana';
        let serviceUrl = source.protocol + source.host;
        let tagNames = $$.all('.TaskTags .Token').map(label => label.textContent);
        return { issueId, issueName, projectName, serviceType, description, serviceUrl, issueUrl, tagNames };
    }
}
IntegrationService.register(new Asana());
