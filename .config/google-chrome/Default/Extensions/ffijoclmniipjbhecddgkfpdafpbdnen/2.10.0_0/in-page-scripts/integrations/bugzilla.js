class Bugzilla {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = '*://*/show_bug.cgi*';
        this.issueElementSelector = '#bugzilla-body';
    }
    render(issueElement, linkElement) {
        var host = $$('#summary_alias_container', issueElement) || $$('#summary_container', issueElement);
        if (host) {
            linkElement.classList.add('devart-timer-link-bugzilla');
            host.appendChild(linkElement);
        }
    }
    getIssue(issueElement, source) {
        var issueIdNumber = $$.try('input[name=id]', issueElement).value;
        if (!issueIdNumber) {
            return;
        }
        var issueId = '#' + issueIdNumber;
        var issueName = $$.try('#short_desc_nonedit_display', issueElement).textContent;
        if (!issueName) {
            return;
        }
        var projectNameEditableElement = $$('#product');
        var projectNameNonEditableElement = $$.try('#field_container_product').firstChild;
        var projectName;
        if (projectNameEditableElement) {
            projectName = projectNameEditableElement.value;
        }
        else if (projectNameNonEditableElement) {
            projectName = projectNameNonEditableElement.textContent;
        }
        var serviceType = 'Bugzilla';
        const action = 'show_bug.cgi';
        var serviceUrl = source.fullUrl.substring(0, source.fullUrl.indexOf(action));
        var issueUrl = `/${action}?id=${issueIdNumber}`;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new Bugzilla());
