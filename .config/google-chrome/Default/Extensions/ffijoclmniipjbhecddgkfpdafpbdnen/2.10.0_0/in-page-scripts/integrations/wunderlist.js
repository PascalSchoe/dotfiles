class Wunderlist {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = '*://www.wunderlist.com/*#/*';
        this.issueElementSelector = () => $$.all('.taskItem:not(.done)')
            .concat($$.all('#detail'));
    }
    render(issueElement, linkElement) {
        let listTaskAnchor = $$('.taskItem-star', issueElement);
        let detailTaskHost = $$('.body', issueElement);
        if (listTaskAnchor) {
            linkElement.classList.add('devart-timer-link-minimal');
            listTaskAnchor.parentElement.insertBefore(linkElement, listTaskAnchor);
        }
        else if (detailTaskHost) {
            linkElement.classList.add('section', 'section-item', 'devart-timer-link-wunderlist-detail');
            detailTaskHost.insertBefore(linkElement, detailTaskHost.firstElementChild);
        }
    }
    getIssueList(issueElement, source) {
        let issueName = $$.try('.taskItem-titleWrapper-title', issueElement).textContent;
        if (!issueName) {
            return;
        }
        let match = /^(\d+)$/.exec(issueElement.getAttribute('rel'));
        if (!match) {
            return;
        }
        let issueId = '#' + match[1];
        let issueUrl = '/#/tasks/' + match[1];
        let projectName;
        if ($$('.sidebarItem.active[rel=week]')) {
            projectName = $$.try('.taskItem-duedate', issueElement).textContent;
        }
        else {
            let tasks = $$.closest('.tasks', issueElement);
            let heading = tasks && $$.prev('.heading', tasks);
            projectName = heading && heading.textContent;
            if (!projectName) {
                projectName = $$.try('#list-toolbar .title').textContent;
            }
        }
        let serviceType = 'Wunderlist';
        let serviceUrl = source.protocol + source.host;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
    getIssueDetail(issueElement, source) {
        let issueName = $$.try('.title-container .display-view', issueElement).textContent;
        if (!issueName) {
            return;
        }
        let match = /^.*\/tasks\/(\d+)(\/.*)?$/.exec(source.fullUrl);
        if (match) {
            var issueId = '#' + match[1];
            var issueUrl = '/#/tasks/' + match[1];
        }
        var projectName = $$.try('#list-toolbar .title').textContent;
        var serviceType = 'Wunderlist';
        var serviceUrl = source.protocol + source.host;
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl };
    }
    getIssue(issueElement, source) {
        return (issueElement.id == 'detail' ? this.getIssueDetail : this.getIssueList)(issueElement, source);
    }
}
IntegrationService.register(new Wunderlist());
