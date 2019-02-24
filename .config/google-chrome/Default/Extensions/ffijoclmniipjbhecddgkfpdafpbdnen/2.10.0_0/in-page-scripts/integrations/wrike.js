class Wrike {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = '*://www.wrike.com/workspace.htm*';
        this.issueElementSelector = '.wspace-task-view';
    }
    render(issueElement, linkElement) {
        let host = $$('.wrike-panel-header-toolbar', issueElement);
        if (host) {
            linkElement.classList.add('devart-timer-link-wrike');
            host.insertBefore(linkElement, host.firstElementChild);
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('textarea.title-field', issueElement).value;
        if (!issueName) {
            return;
        }
        let isModal = !!$$.closest('.x-plain', issueElement);
        let params = $$.searchParams(document.location.hash);
        let issueId = params['t']
            || params['ot']
            || (isModal ? null : params['ei']);
        let issueUrl;
        if (issueId) {
            issueUrl = '/open.htm?id=' + issueId;
            issueId = '#' + issueId;
        }
        let issueTags = $$.all('.wspace-task-widgets-tags-dataview > div', issueElement);
        let projectName;
        if (issueTags.length == 1) {
            projectName = issueTags[0].textContent;
        }
        let serviceType = 'Wrike';
        let serviceUrl = source.protocol + source.host;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new Wrike());
