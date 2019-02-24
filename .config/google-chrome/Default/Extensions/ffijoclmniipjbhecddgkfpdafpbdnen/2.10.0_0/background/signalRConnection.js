class SignalRConnection {
    constructor() {
        this.retryTimeStamp = new Date();
        this.expectedTimerUpdate = false;
        this.disconnecting = false;
        this.onUpdateActiveAccount = SimpleEvent.create();
        this.onInvalidateAccountScopeCache = SimpleEvent.create();
        this.onRemoveExternalIssuesDurations = SimpleEvent.create();
        this.onUpdateTimer = SimpleEvent.create();
        this.onUpdateTracker = SimpleEvent.create();
        this.onUpdateProfile = SimpleEvent.create();
        this.waitAllRejects = Promise.all;
        let signalRInternal = $.signalR.fn;
        Object.defineProperty(signalRInternal, 'reconnectDelay', {
            configurable: true,
            get: () => {
                let delay = 3 + 24 * Math.random();
                return (delay * 1000) | 0;
            }
        });
        this.waitAllRejects = ((promises) => new Promise((resolve, reject) => {
            let error = null;
            let pendingCounter = promises.length;
            promises.forEach(p => p
                .catch((e) => {
                if (error == null) {
                    error = e != null ? e : 'failed';
                }
            })
                .then(() => {
                pendingCounter--;
                if (!pendingCounter && error != null) {
                    reject(error);
                }
            }));
            Promise.all(promises)
                .then(r => resolve(r))
                .catch(() => { });
        }));
    }
    init(serviceUrl, signalRUrl) {
        this.serviceUrl = serviceUrl;
        this.hub = $.hubConnection(signalRUrl);
        this.hub.disconnected(() => {
            this.expectedTimerUpdate = false;
            void 0;
            if (!this.disconnecting) {
                this.disconnect().then(() => {
                    this.setRetryPending(true);
                });
            }
        });
        this.hubProxy = this.hub.createHubProxy('timeTrackerHub');
        this.hubProxy.on('updateTimer', (accountId) => {
            if (this.userProfile && accountId != this.userProfile.activeAccountId) {
                return;
            }
            void 0;
            if (this.expectedTimerUpdate) {
                this.expectedTimerUpdate = false;
                this.getTimer();
            }
            else {
                this.isProfileChanged().then(isProfileChanged => {
                    if (isProfileChanged) {
                        this.reconnect();
                    }
                    else {
                        this.getTimer();
                    }
                });
            }
        });
        this.hubProxy.on('updateActiveAccount', (accountId) => {
            this.onUpdateActiveAccount.emit(accountId);
            if (!this.userProfile || accountId != this.userProfile.activeAccountId) {
                this.reconnect();
            }
            this.onInvalidateAccountScopeCache.emit(accountId);
        });
        this.hubProxy.on('updateAccount', (accountId) => {
            this.onInvalidateAccountScopeCache.emit(accountId);
        });
        this.hubProxy.on('updateProjects', (accountId) => {
            this.onInvalidateAccountScopeCache.emit(accountId);
        });
        this.hubProxy.on('updateClients', (accountId) => {
            this.onInvalidateAccountScopeCache.emit(accountId);
        });
        this.hubProxy.on('updateTags', (accountId) => {
            this.onInvalidateAccountScopeCache.emit(accountId);
        });
        this.hubProxy.on('updateExternalIssuesDurations', (accountId, identifiers) => {
            if (this.userProfile && this.userProfile.activeAccountId == accountId) {
                this.onRemoveExternalIssuesDurations.emit(identifiers);
            }
        });
        return this.reconnect().catch(() => { });
    }
    isProfileChanged() {
        let previousProfileId = this.userProfile && this.userProfile.userProfileId;
        return this.getProfile().then(profile => profile.userProfileId != previousProfileId);
    }
    checkProfileChange() {
        this.isProfileChanged().then(isProfileChanged => {
            if (isProfileChanged) {
                this.reconnect();
            }
        });
    }
    reconnect() {
        void 0;
        return this.disconnect()
            .then(() => this.connect())
            .then(() => this.getTimer());
    }
    setRetryPending(isRetryPending) {
        void 0;
        if (!!this.retryPendingHandle == isRetryPending) {
            return;
        }
        if (isRetryPending) {
            var timeout = this.retryTimeout;
            var fromPreviousRetry = new Date().getTime() - this.retryTimeStamp.getTime();
            if (!timeout || fromPreviousRetry > 5 * 60000) {
                timeout = 30000;
            }
            else {
                timeout = Math.min(timeout * 1.25, 90000);
            }
            this.retryTimeout = timeout;
            timeout *= 1 + Math.random();
            this.retryPendingHandle = setTimeout(() => this.retryConnection(), timeout);
        }
        else if (this.retryPendingHandle) {
            clearTimeout(this.retryPendingHandle);
            this.retryPendingHandle = null;
        }
    }
    retryConnection() {
        void 0;
        this.setRetryPending(false);
        if (!this.hubConnected && !this.retryInProgress) {
            this.retryInProgress = true;
            this.reconnect()
                .catch((err) => {
                if (!(err.statusCode > 0)) {
                    this.setRetryPending(true);
                }
            })
                .then(() => this.retryInProgress = false);
        }
        return Promise.resolve();
    }
    isConnectionRetryEnabled() {
        void 0;
        return Promise.resolve(!!(this.retryPendingHandle || this.retryInProgress));
    }
    connect() {
        void 0;
        return new Promise((callback, reject) => {
            if (this.hubConnected) {
                void 0;
                callback(this.userProfile);
                return;
            }
            this.waitAllRejects([this.getVersion(), this.getProfile()])
                .then(([version, profile]) => {
                this.hub.start({ pingInterval: null })
                    .then(() => {
                    this.hubConnected = true;
                    this.setRetryPending(false);
                    this.hubProxy.invoke('register', profile.userProfileId)
                        .then(() => callback(profile))
                        .fail(reject);
                })
                    .fail(reject);
            })
                .catch(e => {
                void 0;
                reject(e);
            });
        });
    }
    disconnect() {
        this.disconnecting = true;
        var promise = new Promise((callback, reject) => {
            if (this.hubConnected) {
                this.hubConnected = false;
                this.onUpdateTimer.emit(null);
                void 0;
                this.hub.stop(false);
            }
            void 0;
            this.setRetryPending(false);
            callback();
        });
        promise.then(() => this.disconnecting = false);
        promise.catch(() => this.disconnecting = false);
        return promise;
    }
    putTimer(timer) {
        return this.connect().then(profile => {
            let accountId = this.accountToPost || profile.activeAccountId;
            this.expectedTimerUpdate = true;
            let promise = this
                .put(this.getTimerUrl(accountId), timer)
                .then(() => this.checkProfileChange());
            promise.catch(() => {
                this.expectedTimerUpdate = false;
                this.checkProfileChange();
            });
            return promise;
        });
    }
    putIssueTimer(timer) {
        if (!timer.isStarted) {
            return this.putTimer({ isStarted: false });
        }
        return this.connect().then(profile => {
            let accountId = this.accountToPost || profile.activeAccountId;
            this.expectedTimerUpdate = true;
            var promise = this.post(this.getIssueTimerUrl(accountId), timer).then(() => {
                this.checkProfileChange();
            });
            promise.catch(() => {
                this.expectedTimerUpdate = false;
                this.checkProfileChange();
            });
            return promise;
        });
    }
    getIntegration(identifier, accountId, keepAccount) {
        return this.checkProfile().then(profile => this.get(this.getIntegrationProjectUrl(accountId || profile.activeAccountId) + '?' + $.param($.extend({ keepAccount }, identifier), true)));
    }
    postIntegration(identifier) {
        return this.checkProfile().then(profile => this.post(this.getIntegrationProjectUrl(this.accountToPost || profile.activeAccountId), identifier));
    }
    setAccountToPost(accountId) {
        return new Promise(callback => {
            this.accountToPost = accountId;
            callback();
        });
    }
    fetchIssuesDurations(identifiers) {
        void 0;
        return this.checkProfile().then(profile => this.post(this.getTimeEntriesSummaryUrl(profile.activeAccountId), identifiers));
    }
    checkProfile() {
        return new Promise((callback, reject) => {
            var profile = this.userProfile;
            if (profile && profile.activeAccountId) {
                callback(profile);
            }
            else {
                reject();
            }
        });
    }
    getProfile() {
        var profile = this.get('api/userprofile').then(profile => {
            this.userProfile = profile;
            this.onUpdateProfile.emit(profile);
            return profile;
        });
        profile.catch(() => this.disconnect());
        return profile;
    }
    getVersion() {
        return this.get('api/version').then(version => {
            this.serverApiVersion = version;
            return version;
        });
    }
    getTimer() {
        return this.checkProfile().then(profile => {
            var accountId = profile.activeAccountId;
            var userProfileId = profile.userProfileId;
            var url = this.getTimerUrl(accountId);
            var timer = this.get(url).then(timer => {
                this.onUpdateTimer.emit(timer);
                return timer;
            });
            var now = new Date();
            var startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toJSON();
            var endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toJSON();
            url = this.getTimeEntriesUrl(accountId, userProfileId) + `?startTime=${startTime}&endTime=${endTime}`;
            var tracker = this.get(url).then(tracker => {
                this.onUpdateTracker.emit(tracker);
                return tracker;
            });
            var all = Promise.all([timer, tracker]).then(() => undefined);
            all.catch(() => this.disconnect());
            return all;
        });
    }
    getAccountScope(accountId) {
        return this.checkProfile().then(profile => {
            if (!accountId) {
                accountId = profile.activeAccountId;
            }
            var url = 'api/accounts/' + accountId + '/scope';
            return this.get(url);
        });
    }
    getRecentWorkTasks(accountId) {
        var url = 'api/accounts/' + accountId + '/timeentries/recent';
        return this.get(url);
    }
    get(url) {
        return this.ajax(url, 'GET');
    }
    post(url, data) {
        return this.ajax(url, 'POST', data);
    }
    put(url, data) {
        return this.ajax(url, 'PUT', data);
    }
    ajax(url, method, dataReq) {
        var settings = {};
        settings.url = this.serviceUrl + url;
        if (dataReq !== undefined) {
            settings.data = JSON.stringify(dataReq);
            settings.contentType = "application/json";
        }
        var isGet = method == 'GET';
        var isPost = method == 'POST';
        if (isGet || isPost) {
            settings.type = method;
        }
        else {
            settings.type = 'POST';
            settings.headers = {};
            settings.headers['X-HTTP-Method-Override'] = method;
        }
        return new Promise((callback, reject) => {
            var xhr = $.ajax(settings);
            xhr.done(dataRes => {
                if (xhr.status >= 200 && xhr.status < 400) {
                    callback(dataRes);
                }
                else {
                    reject(fail);
                }
            });
            xhr.fail(fail);
            function fail() {
                var statusCode = xhr.status;
                var statusText = xhr.statusText;
                if (xhr.responseJSON) {
                    var responseMessage = xhr.responseJSON.Message;
                }
                if (statusText == 'error') {
                    statusText = '';
                }
                if (statusCode && !statusText) {
                    statusText = SignalRConnection.statusDescriptions[statusCode];
                }
                reject({ statusCode, statusText, responseMessage });
            }
        });
    }
    getIntegrationProjectUrl(accountId) {
        return `api/accounts/${accountId}/integrations/project`;
    }
    getTimerUrl(accountId) {
        return `api/accounts/${accountId}/timer`;
    }
    getIssueTimerUrl(accountId) {
        return `api/accounts/${accountId}/timer/issue`;
    }
    getTimeEntriesUrl(accountId, userProfileId) {
        return `api/accounts/${accountId}/timeentries/${userProfileId}`;
    }
    getTimeEntriesSummaryUrl(accountId) {
        return `api/accounts/${accountId}/timeentries/external/summary`;
    }
}
SignalRConnection.statusDescriptions = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-Uri Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    426: "Upgrade Required",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "Http Version Not Supported",
    507: "Insufficient Storage"
};
