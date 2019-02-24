class Jira {
    constructor() {
        this.showIssueId = true;
        this.observeMutations = true;
        this.issueElementSelector = () => {
            let element = $$('#jira-frontend object');
            return [
                $$.visible([
                    '#ghx-detail-view',
                    '[role=dialog]',
                    '#issue-content',
                    '.new-issue-container'
                ].join(',')),
                element && element.parentElement.parentElement.parentElement
            ];
        };
    }
    match(source) {
        return $$.getAttribute('meta[name=application-name]', 'content') == 'JIRA';
    }
    render(issueElement, linkElement) {
        let host = $$('.command-bar .aui-toolbar2-primary', issueElement);
        if (host) {
            linkElement.classList.add('aui-button');
            host.appendChild(linkElement);
            return;
        }
        host = $$('.command-bar .toolbar-split-left', issueElement);
        if (host) {
            let ul = $$.create('ul', 'toolbar-group');
            let li = $$.create('li', 'toolbar-item');
            linkElement.classList.add('toolbar-trigger');
            li.appendChild(linkElement);
            ul.appendChild(li);
            host.appendChild(ul);
            return;
        }
        host = $$('#ghx-detail-head', issueElement);
        if (host) {
            let container = $$.create('div');
            container.appendChild(linkElement);
            host.appendChild(container);
            return;
        }
        let issueName = $$('h1', issueElement);
        if (!issueName) {
            return;
        }
        let anchor = $$('a[href^="/browse/"][target=_blank]', issueElement);
        if (anchor) {
            linkElement.classList.add('devart-timer-link-jira-next');
            if (issueElement.matches('#ghx-detail-view')) {
                linkElement.classList.add('devart-timer-link-minimal');
            }
            anchor.parentElement.appendChild(linkElement);
            return;
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('dd[data-field-id=summary], h1', issueElement).textContent;
        if (!issueName) {
            return;
        }
        let servicePath = $$.getAttribute('meta[name=ajs-context-path]', 'content');
        let serviceUrl = source.protocol + source.host + servicePath;
        let issueId = $$.searchParams(source.fullUrl)['selectedIssue']
            || (source.path.match(/\/(?:issues|browse)\/([^\/]+)/) || [])[1];
        let issueUrl = issueId && ('/browse/' + issueId);
        let projectName = $$.try('#breadcrumbs-container a', null, el => el.getAttribute('href').split('/').some(v => v == 'projects')).textContent
            || $$.try('#project-name-val').textContent
            || $$.try('.project-title > a').textContent
            || $$.try('.sd-notify-header').textContent
            || $$.try('img', issueElement, (img) => /projectavatar/.test(img.src)).title
            || this.getProjectNameFromNavigationBar();
        let tagNames = $$.all('a', issueElement)
            .filter(el => /jql=labels/.test(el.getAttribute('href')))
            .map(el => el.textContent);
        if (!tagNames.length) {
            tagNames = ($$.try('dd[data-field-id=labels]', issueElement).textContent || '').split(',');
        }
        return { issueId, issueName, issueUrl, projectName, serviceUrl, serviceType: 'Jira', tagNames };
    }
    getProjectNameFromNavigationBar() {
        let avatarElement = $$('#navigation-app span[role="img"], [data-test-id="navigation-apps.project-switcher-v2"] span[role="img"]', null, el => (el.style.backgroundImage || '').indexOf('projectavatar') >= 0);
        let avatarContainer = avatarElement && $$.closest('div,span', avatarElement, el => !!el.innerText);
        let projectNode = avatarContainer && $$.try('div,span', avatarContainer, el => el.textContent && !el.childElementCount);
        if (projectNode && projectNode.offsetWidth) {
            return projectNode.textContent;
        }
    }
}
IntegrationService.register(new Jira());
