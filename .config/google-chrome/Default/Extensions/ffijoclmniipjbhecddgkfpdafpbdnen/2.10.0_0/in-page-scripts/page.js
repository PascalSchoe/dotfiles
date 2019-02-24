var sendBackgroundMessage;
if (typeof document != 'undefined') {
    window.initPage = function () {
        let constants;
        function onBackgroundMessage(message) {
            if (isFinalized) {
                return;
            }
            if (pingTimeouts[message.action]) {
                clearTimeout(pingTimeouts[message.action]);
                pingTimeouts[message.action] = null;
            }
            if (message.action == 'initPage') {
                sendBackgroundMessage({ action: 'getConstants' });
                sendBackgroundMessage({ action: 'getTimer' });
                return;
            }
            if (message.action == 'setTimer') {
                IntegrationService.setTimer(message.data);
                if (IntegrationService.needsUpdate()) {
                    parseAfterPings = true;
                }
            }
            else if (message.action == 'setIssuesDurations') {
                IntegrationService.setIssuesDurations(message.data);
            }
            else if (message.action == 'setConstants') {
                constants = message.data;
                IntegrationService.setConstants(constants);
            }
            if (parseAfterPings) {
                parsePage();
            }
            initialize();
        }
        chrome.runtime.onMessage.addListener(onBackgroundMessage);
        sendBackgroundMessage = function (message) {
            let callbackAction = message.action + '_callback';
            if (pingTimeouts[callbackAction]) {
                clearTimeout(pingTimeouts[callbackAction]);
            }
            pingTimeouts[callbackAction] = setTimeout(() => finalize(), 30000);
            try {
                chrome.runtime.sendMessage(message, response => {
                    let error = chrome.runtime.lastError;
                    if (error) {
                        void 0;
                    }
                });
            }
            catch (e) {
                finalize();
            }
        };
        function startCheckChanges() {
            if (changeCheckerHandle == null) {
                changeCheckerHandle = setInterval(() => {
                    if (document.title != oldTitle || document.URL != oldUrl) {
                        parsePage();
                    }
                    if (!document.hasFocus()) {
                        clearInterval(changeCheckerHandle);
                        changeCheckerHandle = null;
                    }
                }, 100);
            }
        }
        function initialize() {
            if (!isInitialized && !isFinalized) {
                isInitialized = true;
                window.addEventListener('focus', startCheckChanges);
                if (document.hasFocus()) {
                    startCheckChanges();
                }
            }
        }
        function finalize() {
            isFinalized = true;
            for (let ping in pingTimeouts) {
                if (pingTimeouts[ping]) {
                    clearTimeout(pingTimeouts[ping]);
                    pingTimeouts[ping] = null;
                }
            }
            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
            }
            window.removeEventListener('focus', startCheckChanges);
            if (changeCheckerHandle != null) {
                clearInterval(changeCheckerHandle);
                changeCheckerHandle = null;
            }
        }
        function parsePage() {
            for (let ping in pingTimeouts) {
                if (pingTimeouts[ping]) {
                    parseAfterPings = true;
                    return;
                }
            }
            parseAfterPings = false;
            let url = document.URL;
            let title = document.title;
            let checkAllIntegrations = url != oldUrl;
            oldUrl = url;
            oldTitle = title;
            let { issues, observeMutations } = IntegrationService.updateLinks(checkAllIntegrations);
            if (!isFinalized && observeMutations && !mutationObserver) {
                mutationObserver = new MutationObserver(parsePage);
                mutationObserver.observe(document, { childList: true, subtree: true });
            }
        }
        IntegrationService.onIssueLinksUpdated = () => {
            if (mutationObserver) {
                mutationObserver.takeRecords();
            }
        };
        window.parsePage = parsePage;
        let oldUrl = '';
        let oldTitle = '';
        let changeCheckerHandle;
        let mutationObserver;
        let pingTimeouts = {};
        let isInitialized = false;
        let isFinalized = false;
        let parseAfterPings = true;
        IntegrationService.clearPage();
        sendBackgroundMessage({ action: 'getConstants' });
        sendBackgroundMessage({ action: 'getTimer' });
    };
}
