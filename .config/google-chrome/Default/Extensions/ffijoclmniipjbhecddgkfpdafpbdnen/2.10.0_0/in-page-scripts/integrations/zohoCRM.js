class ZohoActivity {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = [
            "https://*/*portal/*/*.do*",
            "https://*/*crm/*"
        ];
    }
    render(issueElement, linkElement) {
        let table = $$('.historycontainer table.floatR');
        if (!table) {
            return;
        }
        linkElement.classList.add('newwhitebtn', 'dIB');
        let button = $$.visible('.newbutton', table);
        if (button) {
            button.parentElement.insertBefore(linkElement, button);
        }
        else {
            let tr = $$.create('tr');
            let td = $$.create('td');
            td.appendChild(linkElement);
            tr.appendChild(td);
            table.appendChild(tr);
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('#subvalue_SUBJECT, #entityNameInBCView').textContent;
        if (!issueName) {
            return;
        }
        let contactName = $$.try('#subvalue_CONTACTID').textContent;
        if (contactName) {
            issueName += ` - ${contactName}`;
        }
        let projectName;
        let serviceUrl;
        let issueUrl;
        let issueId;
        let serviceType;
        let urlRegexp = /^(.*)\/crm\/([^\/]+\/)?tab\/Activities\/(\d+)/;
        let matches = source.fullUrl.match(urlRegexp);
        if (!matches) {
            let activityLinks = $$.all('li.ligraybackground #Subject');
            if (activityLinks.length == 1) {
                let anchor = activityLinks[0].parentElement;
                matches = (anchor.href || '').match(urlRegexp);
            }
        }
        if (matches) {
            serviceType = 'ZohoCRM';
            serviceUrl = matches[1];
            issueId = matches[3] || matches[2];
            issueUrl = `/crm/tab/Activities/${issueId}`;
        }
        return { issueId, issueName, issueUrl, projectName, serviceUrl, serviceType };
    }
}
class ZohoProject {
    constructor() {
        this.showIssueId = false;
        this.observeMutations = true;
        this.matchUrl = '*://*/portal/*/bizwoheader.do*';
    }
    render(issueElement, linkElement) {
        let panel = $$('.detail-updates');
        if (panel) {
            linkElement.classList.add('devart-timer-link-zoho-project');
            panel.insertBefore(linkElement, panel.lastElementChild);
        }
    }
    getIssue(issueElement, source) {
        let issueName = $$.try('textarea.taskedit, #tdetails_task textarea').value
            || $$.try('textarea.detail-tsktitle').value;
        let projectName = $$.try('.detail-hierarchy a').textContent
            || $$.try('.detail-hierarchy span > span').textContent
            || $$.try('.topband_projsel [id^="projlink_"]').textContent;
        return { issueName, projectName };
    }
}
IntegrationService.register(new ZohoActivity(), new ZohoProject());
