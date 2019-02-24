
/*
 * Console.log facade with debug flag
 */

(function() {
  var PunchtimeBackgroundPage, PunchtimeLogger, PunchtimeTimer,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  PunchtimeLogger = (function() {
    function PunchtimeLogger() {}

    PunchtimeLogger._debug = false;

    PunchtimeLogger.prototype.l = function() {
      var msg;
      msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this._debug) {
        return console.log.apply(console, msg);
      }
    };

    return PunchtimeLogger;

  })();


  /*
   * Main class manages integration of PT in Trello
   */

  PunchtimeTimer = (function(_super) {
    __extends(PunchtimeTimer, _super);

    PunchtimeTimer.prototype._debug = false;

    PunchtimeTimer.prototype._initialized = false;

    PunchtimeTimer.prototype._timer = {};

    PunchtimeTimer.prototype._chromeStorageStrategy = 'sync';

    function PunchtimeTimer() {
      this._debug = window.PunchtimeDebug || false;
    }

    PunchtimeTimer.prototype.initialize = function() {
      if (this.initialized) {
        return;
      }
      this.l("-> Starting Timer Support");
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.storage.onChanged.addListener((function(_this) {
          return function(changes, namespace) {
            if ((changes.timer != null) && namespace === _this._chromeStorageStrategy && !_this._identical(changes.timer.newValue, _this._timer)) {
              _this.l('-> The timer was changed somewhere else');
              _this._timer = changes.timer.newValue;
              return _this._resumeFromTimer();
            }
          };
        })(this));
      }
      this._loadTimerFromStorage((function(_this) {
        return function(newTimer) {
          if (newTimer) {
            _this._timer = newTimer;
            _this._resumeFromTimer();
          } else {
            _this.cancelTimer();
          }
          return $(window).trigger('pt:timerloaded');
        };
      })(this));
      return this.initialized = true;
    };

    PunchtimeTimer.prototype.toggleTimer = function() {
      if (this._timer.isRunning) {
        return this.pauseTimer();
      } else {
        return this.startTimer();
      }
    };

    PunchtimeTimer.prototype.startTimer = function(board, card) {
      if (board == null) {
        board = null;
      }
      if (card == null) {
        card = null;
      }
      this.l('-> Starting timer');
      this._timer.isRunning = true;
      if (board != null) {
        this._timer.board = board.trello_id;
        this._timer.boardName = board.name;
        this._timer.boardUrl = board.punchtime_url;
        if (card != null) {
          this._timer.card = card.shortId;
          this._timer.cardName = card.name;
          this._timer.cardId = card.shortCode;
        }
      }
      if (!this._timer.isRunningSince) {
        this._timer.isRunningSince = new Date().getTime();
      }
      $(window).trigger('pt:timerstart');
      this.activateTimer();
      this._setToolbarIcon();
      return this._storeTimer();
    };

    PunchtimeTimer.prototype.pauseTimer = function(callback) {
      this.l('-> Pausing timer');
      this._timer.isRunning = false;
      if (this._timer.isRunningSince != null) {
        this._timer.savedDuration += parseInt((new Date().getTime() - this._timer.isRunningSince) / 1000);
        this._timer.isRunningSince = null;
      }
      $(window).trigger('pt:timerpause');
      this._setToolbarIcon();
      if (callback == null) {
        this._storeTimer();
      }
      return typeof callback === "function" ? callback() : void 0;
    };

    PunchtimeTimer.prototype.cancelTimer = function() {
      this.l('-> Canceling timer');
      if (this._timer.isRunning) {
        this.pauseTimer((function(_this) {
          return function() {
            _this._setPristineTimer();
            _this.deactivateTimer();
            return _this._storeTimer();
          };
        })(this));
      } else {
        this._setPristineTimer();
        this.deactivateTimer();
        this._storeTimer();
      }
      return this._setToolbarIcon();
    };

    PunchtimeTimer.prototype.commitTimer = function(emit) {
      if (emit == null) {
        emit = true;
      }
      if (this._timer.isActive) {
        this.l('-> Committing timer');
        if (this._timer.isRunning) {
          this.pauseTimer();
        }
        if (emit) {
          return $(window).trigger('pt:timercommitrequest');
        }
      }
    };

    PunchtimeTimer.prototype.activateTimer = function() {
      this.l('-> Activating timer');
      this._timer.isActive = true;
      return $(window).trigger('pt:timeractivated');
    };

    PunchtimeTimer.prototype.deactivateTimer = function() {
      this.l('-> Deactivating timer');
      this._timer.isActive = false;
      return $(window).trigger('pt:timerdeactivated');
    };

    PunchtimeTimer.prototype.getDuration = function() {
      var hours, minutes, s;
      if (this._timer.isActive) {
        s = this._timer.isRunning ? this._timer.savedDuration + parseInt((new Date().getTime() - this._timer.isRunningSince) / 1000) : this._timer.savedDuration;
        hours = parseInt(s / 3600);
        minutes = parseInt(s / 60) % 60;
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        return "" + hours + ":" + minutes;
      } else {
        return "0";
      }
    };

    PunchtimeTimer.prototype._setToolbarIcon = function() {
      var error;
      if (typeof chrome !== "undefined" && chrome !== null) {
        if (this._timer.isActive) {
          chrome.browserAction.setIcon({
            path: {
              19: "tool-19-running.png",
              38: "tool-38-running.png"
            }
          }, function() {});
        } else {
          chrome.browserAction.setIcon({
            path: {
              19: "tool-19-default.png",
              38: "tool-38-default.png"
            }
          }, function() {});
        }
      }
      if (typeof safari !== "undefined" && safari !== null) {
        try {
          if (this._timer.isActive) {
            return safari.extension.toolbarItems.forEach(function(el, i) {
              return safari.extension.toolbarItems[i].image = "" + safari.extension.baseURI + "tool-16-running.png";
            });
          } else {
            return safari.extension.toolbarItems.forEach(function(el, i) {
              return safari.extension.toolbarItems[i].image = "" + safari.extension.baseURI + "tool-16-default.png";
            });
          }
        } catch (_error) {
          error = _error;
          return this.l("X: Could not set Safari icon image");
        }
      }
    };

    PunchtimeTimer.prototype._setPristineTimer = function() {
      return this._timer = {
        isActive: false,
        board: null,
        boardName: null,
        boardUrl: null,
        card: null,
        cardName: null,
        cardId: null,
        isRunning: false,
        isRunningSince: null,
        savedDuration: 0
      };
    };

    PunchtimeTimer.prototype._storeTimer = function() {
      return this._loadTimerFromStorage((function(_this) {
        return function(storedTimer) {
          var error;
          if (_this._identical(_this._timer, storedTimer)) {
            return;
          }
          try {
            if (typeof chrome !== "undefined" && chrome !== null) {
              chrome.storage[_this._chromeStorageStrategy].set({
                'timer': _this._timer
              }, function() {});
            }
            if (typeof safari !== "undefined" && safari !== null) {
              localStorage.setItem("timer", JSON.stringify(_this._timer));
            }
            $(window).trigger('pt:timerchanged');
            return _this.l('-> stored timer');
          } catch (_error) {
            error = _error;
            return _this.l("X: Failed to store timer");
          }
        };
      })(this));
    };

    PunchtimeTimer.prototype._loadTimerFromStorage = function(callback) {
      var error, timer;
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.storage[this._chromeStorageStrategy].get('timer', (function(_this) {
          return function(o) {
            return typeof callback === "function" ? callback(o.timer != null ? o.timer : null) : void 0;
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        try {
          timer = localStorage.getItem("timer");
          timer = JSON.parse(timer);
        } catch (_error) {
          error = _error;
          timer = {};
        }
        return typeof callback === "function" ? callback(timer) : void 0;
      }
    };

    PunchtimeTimer.prototype._resumeFromTimer = function() {
      if (this._timer.isActive) {
        this.l('-> Restoring timer from sync');
        if (this._timer.isRunning) {
          return this.startTimer();
        } else {
          this.activateTimer();
          return this.pauseTimer();
        }
      } else {
        this.l('-> Starting with a pristine timer');
        return this.cancelTimer();
      }
    };

    PunchtimeTimer.prototype._identical = function(o, oo) {
      return JSON.stringify(o) === JSON.stringify(oo);
    };

    return PunchtimeTimer;

  })(PunchtimeLogger);

  PunchtimeBackgroundPage = (function() {
    PunchtimeBackgroundPage.prototype._timerLoaded = false;

    PunchtimeBackgroundPage.prototype._addLogPopup = null;

    PunchtimeBackgroundPage.prototype._scriptWindows = [];

    PunchtimeBackgroundPage.prototype._chromeStorageStrategy = 'sync';

    PunchtimeBackgroundPage.prototype._lastSafariPopupWindow = null;

    PunchtimeBackgroundPage.prototype.t = null;

    function PunchtimeBackgroundPage() {
      $(window).on('pt:timerloaded', (function(_this) {
        return function(e) {
          return _this.handleTimerLoaded(e);
        };
      })(this));
      $(window).on('pt:timerchanged', (function(_this) {
        return function(e) {
          return _this.handleTimerChanged(e);
        };
      })(this));
      $(window).on('pt:popovermessage', (function(_this) {
        return function(e, data) {
          return _this.safariReceiveMessage(data);
        };
      })(this));
      this.t = new PunchtimeTimer();
      this.t.initialize();
      if (typeof safari !== "undefined" && safari !== null) {
        safari.extension.secureSettings.addEventListener("change", (function(_this) {
          return function(e) {
            return _this.safariSettingChanged(e);
          };
        })(this), false);
        safari.application.addEventListener("message", (function(_this) {
          return function(e) {
            return _this.safariReceiveMessage(e);
          };
        })(this), false);
        safari.application.addEventListener("close", (function(_this) {
          return function(e) {
            return _this.safariWindowClosed(e);
          };
        })(this), true);
        safari.application.addEventListener("open", (function(_this) {
          return function(e) {
            return _this.t._setToolbarIcon();
          };
        })(this), true);
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.runtime.onMessage.addListener((function(_this) {
          return function(q, s, r) {
            return _this.chromeReceiveMessage(q, s, r);
          };
        })(this));
        chrome.runtime.onMessageExternal.addListener((function(_this) {
          return function(q, s, r) {
            return _this.chromeReceiveMessage(q, s, r);
          };
        })(this));
        chrome.windows.onRemoved.addListener((function(_this) {
          return function(e) {
            return _this.chromeWindowClosed(e);
          };
        })(this));
      }
    }

    PunchtimeBackgroundPage.prototype.handleTimerLoaded = function(e) {
      return this._timerLoaded = true;
    };

    PunchtimeBackgroundPage.prototype.handleTimerChanged = function(e) {
      if (typeof safari !== "undefined" && safari !== null) {
        return this.safariSendMessage('timer:changed', this.t._timer);
      }
    };

    PunchtimeBackgroundPage.prototype.safariSettingChanged = function(event) {
      if (event.key === 'token') {
        return this.safariSendMessage('updateTokenFromSettings', event.newValue);
      }
    };

    PunchtimeBackgroundPage.prototype.safariReceiveMessage = function(event) {
      var value;
      switch (event.name) {
        case "setTokenToSettings":
          return safari.extension.secureSettings.setItem('token', event.message.token);
        case "getTokenFromSettings":
          value = safari.extension.secureSettings.getItem('token');
          return this.safariSendMessage('updateTokenFromSettings', value);
        case "closePopups":
          return this.closePopups();
        case "logAddedFromPopup":
          return this.safariAddedFromPopup();
        case "setScriptWindow":
          return this.safariSetWindow(event);
        case "timer:cancel":
          return this.t.cancelTimer();
        case "timer:start":
          return this.t.startTimer(event.message.board, event.message.card);
        case "timer:pause":
          return this.t.pauseTimer();
        case "timer:resume":
          return this.t.startTimer();
        case "timer:commit":
          return this.handleCommitTimer();
        case "timer:emitstate":
          return this.emitTimerState();
        case "requestLoginRelay":
          return this.safariSendMessageToFrontmost("requestLogin", true);
        case "requestPageReadyRelay":
          return this.safariSendMessageToFrontmost("requestPageReady", true);
        case "requestPunchtimePageReadyRelay":
          return this.safariSendMessageToFrontmost("requestPunchtimePageReady", true);
        case "trelloPageReady":
          return this.handleTrelloPageReady();
        case "punchtimePageReady":
          return this.handlePunchtimePageReady();
        case "trelloPageNotLoggedIn":
          return this.handleTrelloPageNotLoggedIn();
        case "requestTimerStartRelay":
          return this.safariSendMessageToFrontmost("requestTimerStart", true);
        case "requestLogAddRelay":
          return this.safariSendMessageToFrontmost("requestLogAdd", true);
        case "performLogAdd":
          return this.handleAddLog(event.message.board, event.message.card);
        default:
          return console.log('Unhandled message', event);
      }
    };

    PunchtimeBackgroundPage.prototype.safariAddedFromPopup = function() {
      if (this._lastSafariPopupWindow != null) {
        this._lastSafariPopupWindow.close();
      }
      return this.t.cancelTimer();
    };

    PunchtimeBackgroundPage.prototype.safariSetWindow = function(event) {
      return this._scriptWindows.push(event.target);
    };

    PunchtimeBackgroundPage.prototype.safariSendMessageToFrontmost = function(key, value) {
      return safari.application.activeBrowserWindow.activeTab.page.dispatchMessage(key, value);
    };

    PunchtimeBackgroundPage.prototype.safariSendMessage = function(key, value, one) {
      if (one == null) {
        one = false;
      }
      return this._scriptWindows.forEach((function(_this) {
        return function(tab) {
          if ((tab != null) && (tab.page != null)) {
            tab.page.dispatchMessage(key, value);
            if (one) {

            }
          }
        };
      })(this));
    };

    PunchtimeBackgroundPage.prototype.safariWindowClosed = function(event) {
      var url;
      url = (event.target.activeTab != null) && (event.target.activeTab.url != null) ? event.target.activeTab.url : "";
      if (url.indexOf('extension_log') !== -1 && url.indexOf('added') !== -1) {
        return this.safariSendMessage('updateCurrentBoard');
      }
    };

    PunchtimeBackgroundPage.prototype.chromeReceiveMessage = function(request, sender, sendResponse) {
      sendResponse({
        received: true
      });
      switch (request.message) {
        case "setTokenToSettings":
          return chrome.storage[this._chromeStorageStrategy].set({
            'token': request.token
          }, (function(_this) {
            return function() {};
          })(this));
        case "getTokenFromSettings":
          return chrome.storage[this._chromeStorageStrategy].get('token', (function(_this) {
            return function(o) {
              return _this.chromeSendMessage({
                message: 'updateTokenFromSettings',
                token: o.token
              });
            };
          })(this));
        case "addLogPopupOpened":
          return this.popupWasOpened();
        case "closePopups":
          return this.closePopups();
        case "logAddedFromPopup":
          return this.chromeLogAddedFromPopup(request.url, request.timer);
        case "timer:cancel":
          return this.t.cancelTimer();
        case "timer:start":
          return this.t.startTimer(request.value.board, request.value.card);
        case "timer:pause":
          return this.t.pauseTimer();
        case "timer:resume":
          return this.t.startTimer();
        case "timer:commit":
          return this.handleCommitTimer();
        case "trelloPageReady":
          return this.handleTrelloPageReady();
        case "punchtimePageReady":
          return this.handlePunchtimePageReady();
        case "trelloPageNotLoggedIn":
          return this.handleTrelloPageNotLoggedIn();
        case "requestLoginRelay":
          return this.chromeSendMessageFrontmost({
            message: "requestLogin"
          });
        case "requestPageReadyRelay":
          return this.chromeSendMessageFrontmost({
            message: "requestPageReady"
          });
        case "requestPunchtimePageReadyRelay":
          return this.chromeSendMessageFrontmost({
            message: "requestPunchtimePageReady"
          });
        case "requestTimerStartRelay":
          return this.chromeSendMessageFrontmost({
            message: "requestTimerStart"
          });
        case "requestLogAddRelay":
          return this.chromeSendMessageFrontmost({
            message: "requestLogAdd"
          });
        default:
          return console.log("unhandled message", request);
      }
    };

    PunchtimeBackgroundPage.prototype.chromeLogAddedFromPopup = function(url, forTimer) {
      if (forTimer == null) {
        forTimer = false;
      }
      console.log('log added', url, forTimer);
      this.chromeSendMessage({
        message: 'updateCurrentBoard'
      });
      if (forTimer) {
        return this.t.cancelTimer();
      }
    };

    PunchtimeBackgroundPage.prototype.chromeWindowClosed = function(windowId) {
      if (windowId === this._addLogPopup) {
        return this._addLogPopup = null;
      }
    };

    PunchtimeBackgroundPage.prototype.chromeSendMessage = function(envelope) {
      return chrome.tabs.query({}, function(tabs) {
        var tab, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = tabs.length; _i < _len; _i++) {
          tab = tabs[_i];
          _results.push(chrome.tabs.sendMessage(tab.id, envelope));
        }
        return _results;
      });
    };

    PunchtimeBackgroundPage.prototype.chromeSendMessageFrontmost = function(envelope) {
      return chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        return chrome.tabs.sendMessage(tabs[0].id, envelope);
      });
    };

    PunchtimeBackgroundPage.prototype.handleTrelloPageNotLoggedIn = function() {
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.extension.getViews({
          "type": "popup"
        }).forEach((function(_this) {
          return function(el, i) {
            return el.directMessage("trelloPageNotLoggedIn");
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.extension.toolbarItems[0].popover.contentWindow.directMessage("trelloPageNotLoggedIn");
      }
    };

    PunchtimeBackgroundPage.prototype.handleTrelloPageReady = function() {
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.extension.getViews({
          "type": "popup"
        }).forEach((function(_this) {
          return function(el, i) {
            return el.directMessage("trelloPageReady");
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.extension.toolbarItems[0].popover.contentWindow.directMessage("trelloPageReady");
      }
    };

    PunchtimeBackgroundPage.prototype.handlePunchtimePageReady = function() {
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.extension.getViews({
          "type": "popup"
        }).forEach((function(_this) {
          return function(el, i) {
            return el.directMessage("punchtimePageReady");
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.extension.toolbarItems[0].popover.contentWindow.directMessage("punchtimePageReady");
      }
    };

    PunchtimeBackgroundPage.prototype.handleAddLog = function(board, card) {
      var url;
      console.log('opening log popup', board, card);
      url = "" + board.punchtime_url + "/extension_log?";
      if (card != null) {
        url += "description=%23" + card.idShort + "&";
      }
      return this.openPopupForUrl(url);
    };

    PunchtimeBackgroundPage.prototype.handleCommitTimer = function() {
      var defaultDuration, forCard, url;
      this.t.commitTimer(false);
      forCard = this.t._timer.card != null;
      defaultDuration = this.t.getDuration();
      url = "" + this.t._timer.boardUrl + "/extension_log?";
      if (forCard) {
        url += "description=%23" + this.t._timer.cardId + "&";
      }
      url += "duration=" + defaultDuration + "&";
      url += "timer=1&";
      return this.openPopupForUrl(url);
    };

    PunchtimeBackgroundPage.prototype.openPopupForUrl = function(url) {
      var e, h, left, token, top, w;
      w = Math.min(800, screen.width);
      h = 320;
      left = (screen.width / 2) - (w / 2);
      top = (screen.height / 2) - (h / 2);
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.storage[this._chromeStorageStrategy].get('token', (function(_this) {
          return function(o) {
            var popup;
            if ((o.token != null) && o.token.length > 0) {
              url += "token=" + o.token;
            }
            popup = window.open(url, "add_log", "width=" + w + ", height=" + h + ", left=" + left + ", top=" + top + ", toolbar=no, menubar=no, scrollbars=no, location=no, personalbar=no, status=no");
            popup.focus();
            return chrome.runtime.sendMessage({
              message: "addLogPopupOpened"
            });
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        try {
          token = safari.extension.secureSettings.getItem('token');
          url += "token=" + token;
          this._lastSafariPopupWindow = safari.application.openBrowserWindow();
          return this._lastSafariPopupWindow.activeTab.url = url;
        } catch (_error) {
          e = _error;
          return console.log("X: Could not load token from settings", e);
        }
      }
    };

    PunchtimeBackgroundPage.prototype.emitTimerState = function() {
      if (typeof safari !== "undefined" && safari !== null) {
        return this.safariSendMessage('timer:state', this.t._timer);
      }
    };

    PunchtimeBackgroundPage.prototype.closePopups = function() {
      if (typeof safari !== "undefined" && safari !== null) {
        safari.application.browserWindows.forEach((function(_this) {
          return function(win) {
            if (win.activeTab.url.indexOf('extension_log') !== -1) {
              return win.close();
            }
          };
        })(this));
      }
      if ((typeof chrome !== "undefined" && chrome !== null) && (this._addLogPopup != null)) {
        chrome.windows.remove(this._addLogPopup);
        return this._addLogPopup = null;
      }
    };

    PunchtimeBackgroundPage.prototype.popupWasOpened = function() {
      if (typeof chrome !== "undefined" && chrome !== null) {
        return chrome.tabs.query({
          active: true,
          currentWindow: true
        }, (function(_this) {
          return function(tabs) {
            return _this._addLogPopup = tabs[0].windowId;
          };
        })(this));
      }
    };

    return PunchtimeBackgroundPage;

  })();

  window.PunchtimeDebug = false;

  document.addEventListener("DOMContentLoaded", function(event) {
    return window['puchtimeBackgroundPage'] = new PunchtimeBackgroundPage();
  });

}).call(this);
