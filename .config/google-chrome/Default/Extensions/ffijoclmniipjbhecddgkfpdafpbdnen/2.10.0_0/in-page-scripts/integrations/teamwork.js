let hosts = '((teamwork|seetodos|companytodos|worktodos|companyworkflow|projectgameplan|peopleworkflow|projecttodos|projectorganiser|seetasks)\.com|teamworkpm\.net)';
class Teamwork {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = new RegExp('.*:\/\/.*\.' + hosts + '\/.*');
    }
    issueElementSelector() {
        return $$.all('.row-content-holder');
    }
    render(issueElement, linkElement) {
        let host = $$('.task-options', issueElement);
        if (host) {
            let container = $$.create('span');
            linkElement.classList.add('option');
            container.classList.add('devart-timer-link-teamwork');
            container.appendChild(linkElement);
            host.insertBefore(container, host.querySelector('.task-options > a:not(.active)'));
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('.task-name > span', issueElement).textContent;
        if (!issueName) {
            return;
        }
        let issueId;
        let issueUrl;
        let issueHref = $$.getAttribute('.task-name a[href*="tasks"]', 'href', issueElement);
        let matches = issueHref.match(/^.*tasks\/(\d+)$/);
        if (matches) {
            issueId = '#' + matches[1];
            issueUrl = 'tasks/' + matches[1];
        }
        let projectName;
        let projectNameElement = $$('#projectName');
        if (projectNameElement) {
            projectName = projectNameElement.firstChild.textContent;
        }
        if (!projectName) {
            let parentRowElement = $$.closest('tr', issueElement);
            if (parentRowElement) {
                projectName = $$.try('.prjName', parentRowElement).textContent;
            }
            else {
                projectName = $$.try('#top-left-header h3').textContent;
            }
        }
        let serviceType = 'Teamwork';
        let serviceUrl = source.protocol + source.host;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
class TeamworkDesk {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.matchUrl = new RegExp('.*:\/\/.*\.' + hosts + '\/desk\/.*');
    }
    issueElementSelector() {
        return $$.all('.ticket--header').concat($$.all('.task-row'));
    }
    isTicketElement(issueElement) {
        return issueElement.classList.contains('ticket--header');
    }
    render(issueElement, linkElement) {
        if (this.isTicketElement(issueElement)) {
            let host = $$('.padding-wrap', issueElement);
            if (host) {
                let linkContainer = $$.create('div', 'devart-timer-link-teamwork-desk-ticket');
                linkContainer.appendChild(linkElement);
                host.appendChild(linkContainer);
            }
        }
        else {
            let host = $$('.task-options', issueElement);
            if (host) {
                linkElement.classList.add('devart-timer-link-teamwork-desk-task');
                host.parentElement.insertBefore(linkElement, host);
            }
        }
    }
    getIssue(issueElement, source) {
        var issueName, issueId, issueIdNumber, issueUrlPrefix, projectName;
        if (this.isTicketElement(issueElement)) {
            issueName = $$.try('.title-label a', issueElement).textContent;
            issueId = $$.try('.id-hold', issueElement).textContent;
            issueIdNumber = issueId.replace(/^\#/, '');
            issueUrlPrefix = 'desk/#/tickets/';
        }
        else {
            issueName = $$.try('.title-label', issueElement).textContent;
            let issueHref = $$.getAttribute('.title-label', 'href', issueElement);
            let issueHrefMatch = /^.*tasks\/(\d+)$/.exec(issueHref);
            issueIdNumber = issueHrefMatch && issueHrefMatch[1];
            issueId = '#' + issueIdNumber;
            issueUrlPrefix = 'tasks/';
            projectName = $$.try('ul.task-meta.list-inline a', issueElement, el => /\/projects\/\d+/.test(el.getAttribute('href'))).textContent;
        }
        if (!issueName) {
            return;
        }
        if (issueIdNumber && (issueIdNumber = issueIdNumber.trim())) {
            var issueUrl = issueUrlPrefix + issueIdNumber;
        }
        var serviceType = 'Teamwork';
        var serviceUrl = source.protocol + source.host;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
}
IntegrationService.register(new Teamwork());
IntegrationService.register(new TeamworkDesk());
