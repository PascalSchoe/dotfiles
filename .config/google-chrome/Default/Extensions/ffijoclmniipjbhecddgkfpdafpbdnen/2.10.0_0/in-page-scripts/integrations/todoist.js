class Todoist {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = '*://*todoist.com/app*';
        this.issueElementSelector = '.task_item';
    }
    render(issueElement, linkElement) {
        var host = $$('.content > .text', issueElement);
        if (host) {
            linkElement.classList.add('devart-timer-link-todoist');
            host.insertBefore(linkElement, host.lastChild);
        }
    }
    getIssue(issueElement, source) {
        let issueNumber = issueElement.id.split('_')[1];
        if (!issueNumber) {
            return;
        }
        let issueId = '#' + issueNumber;
        let issueName = $$
            .findAllNodes('.content > .text', null, issueElement)
            .filter(node => {
            if (node.nodeType == Node.TEXT_NODE) {
                return true;
            }
            if (node.nodeType != Node.ELEMENT_NODE) {
                return false;
            }
            let tag = node;
            if (['B', 'I', 'STRONG', 'EM'].indexOf(tag.tagName) >= 0) {
                return true;
            }
            if (tag.tagName != 'A') {
                return false;
            }
            if (tag.classList.contains('ex_link')) {
                return true;
            }
            let href = tag.getAttribute('href');
            if (href && !href.indexOf("mailto:")) {
                return true;
            }
        })
            .reduce((sumText, node) => {
            let text = node.textContent;
            if (text[0] == ' ' && sumText[sumText.length - 1] == ' ') {
                text = text.substring(1);
            }
            return sumText + text;
        }, "");
        if (!issueName) {
            return;
        }
        let projectName = $$.try('.project_item__name', issueElement).textContent ||
            $$.try('.project_link').textContent ||
            $$.try('.pname', issueElement).textContent;
        let serviceType = 'Todoist';
        let serviceUrl = source.protocol + source.host;
        let issueUrl = 'showTask?id=' + issueNumber;
        let tagNames = $$.all('.labels_holder .label:not(.label_sep)', issueElement).map(label => label.textContent);
        return { issueId, issueName, projectName, serviceType, serviceUrl, issueUrl, tagNames };
    }
}
IntegrationService.register(new Todoist());
