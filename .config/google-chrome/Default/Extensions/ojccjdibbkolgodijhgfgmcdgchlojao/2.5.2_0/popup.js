(function() {
  var PunchtimePopupPage;

  PunchtimePopupPage = (function() {
    PunchtimePopupPage.prototype._chromeStorageStrategy = 'sync';

    PunchtimePopupPage.prototype._lastKnownTimer = {};

    PunchtimePopupPage.prototype._displayUpdateInterval = null;

    PunchtimePopupPage.prototype._displayTick = true;

    PunchtimePopupPage.prototype._prevTime = ["00", "00"];

    function PunchtimePopupPage() {
      var e, timer;
      $(document).on('click', '.js-pt-pause-timer', (function(_this) {
        return function(e) {
          return _this.pauseTimer();
        };
      })(this));
      $(document).on('click', '.js-pt-resume-timer', (function(_this) {
        return function(e) {
          return _this.resumeTimer();
        };
      })(this));
      $(document).on('click', '.js-pt-cancel-timer', (function(_this) {
        return function(e) {
          return _this.cancelTimer();
        };
      })(this));
      $(document).on('click', '.js-pt-commit-timer', (function(_this) {
        return function(e) {
          return _this.commitTimer();
        };
      })(this));
      $(document).on('click', '.js-pt-login', (function(_this) {
        return function(e) {
          return _this.requestLogin();
        };
      })(this));
      $(document).on('click', '.js-pt-start-timer', (function(_this) {
        return function(e) {
          return _this.startTimer();
        };
      })(this));
      $(document).on('click', '.js-pt-add-log', (function(_this) {
        return function(e) {
          return _this.addLog();
        };
      })(this));
      $(document).on('click', '.js-pt-open-timer', (function(_this) {
        return function(e) {
          return _this.handleOpenWindow('timer');
        };
      })(this));
      $(document).on('click', '.js-pt-open-help', (function(_this) {
        return function(e) {
          return _this.handleOpenWindow('help');
        };
      })(this));
      $(document).on('click', '.js-pt-open-trello', (function(_this) {
        return function(e) {
          return _this.handleOpenWindow(_this._lastKnownTimer.isActive ? 'timer' : 'trello');
        };
      })(this));
      $(document).on('click', '.js-pt-open-punchtime', (function(_this) {
        return function(e) {
          return _this.handleOpenWindow(_this._lastKnownTimer.isActive ? 'logs' : 'punchtime');
        };
      })(this));
      $(window).on('pt:backgroundmessage', (function(_this) {
        return function(e, data) {
          return _this.handleBackgroundMessage(data);
        };
      })(this));
      if (typeof chrome !== "undefined" && chrome !== null) {
        $('body').addClass('chrome');
        chrome.storage.onChanged.addListener((function(_this) {
          return function(changes, namespace) {
            if ((changes.timer != null) && namespace === _this._chromeStorageStrategy) {
              return _this.handleTimerChange(changes.timer.newValue);
            }
          };
        })(this));
        chrome.storage[this._chromeStorageStrategy].get('timer', (function(_this) {
          return function(o) {
            if (o.timer != null) {
              return _this.handleTimerChange(o.timer);
            }
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        safari.application.addEventListener('popover', (function(_this) {
          return function(e) {
            return _this.popupWillDisplay();
          };
        })(this), true);
        window.addEventListener('storage', (function(_this) {
          return function(e) {
            if (e.key === "timer") {
              try {
                return _this.handleTimerChange(JSON.parse(e.newValue));
              } catch (_error) {
                e = _error;
                return console.log('could not parse timer change event', e);
              }
            }
          };
        })(this), false);
        try {
          timer = localStorage.getItem("timer");
          this.handleTimerChange(JSON.parse(timer));
        } catch (_error) {
          e = _error;
          console.log('could not load timer', e);
        }
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        this.popupWillDisplay();
      }
    }

    PunchtimePopupPage.prototype.popupWillDisplay = function() {
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.tabs.query({
          active: true,
          currentWindow: true
        }, (function(_this) {
          return function(tabs) {
            return _this.popupWillDisplayHelper(tabs[0].url);
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        $('body').removeClass('has-timer-available has-only-timer-available not-logged-in');
        return this.popupWillDisplayHelper(safari.application.activeBrowserWindow.activeTab.url);
      }
    };

    PunchtimePopupPage.prototype.popupWillDisplayHelper = function(url) {
      var l;
      l = document.createElement("a");
      l.href = url;
      if (l.hostname === 'trello.com') {
        this._sendMessage('requestPageReadyRelay', true);
      }
      if (l.hostname === 'app.punchti.me') {
        this._sendMessage('requestPunchtimePageReadyRelay', true);
      }
      return window.setTimeout(function() {
        return $('body').addClass('animated');
      }, 300);
    };

    PunchtimePopupPage.prototype.handleBackgroundMessage = function(message) {
      if (message === "trelloPageReady") {
        $('body').addClass('has-timer-available');
        $('body').removeClass('not-logged-in');
      }
      if (message === "punchtimePageReady") {
        $('body').addClass('has-timer-available has-only-timer-available');
        $('body').removeClass('not-logged-in');
      }
      if (message === "trelloPageNotLoggedIn") {
        $('body').removeClass('has-timer-available');
        return $('body').addClass('not-logged-in');
      }
    };

    PunchtimePopupPage.prototype.handleTimerChange = function(newTimer) {
      console.log('updating UI for timer', newTimer);
      this._lastKnownTimer = newTimer;
      if (newTimer.isActive) {
        $('.js-pt-board-name').html(newTimer.boardName);
        $('.js-pt-card-name').html("" + newTimer.cardId + "  " + newTimer.cardName);
      }
      $('body').toggleClass('timer-on-card', newTimer.card != null);
      $('body').toggleClass('timer-active', newTimer.isActive);
      $('body').toggleClass('timer-running', newTimer.isRunning);
      if (newTimer.isRunning) {
        if (!this._displayUpdateInterval) {
          this._displayUpdateInterval = window.setInterval((function(_this) {
            return function() {
              return _this._updateDisplay();
            };
          })(this), 1000);
        }
      } else {
        window.clearInterval(this._displayUpdateInterval);
        this._displayUpdateInterval = null;
      }
      return this._updateDisplay();
    };

    PunchtimePopupPage.prototype.handleOpenWindow = function(type) {
      var popup, url;
      url = "";
      switch (type) {
        case 'help':
          url = "http://punchtime.uservoice.com/knowledgebase/articles/464619";
          break;
        case 'trello':
          url = "https://trello.com";
          break;
        case 'punchtime':
          url = "https://app.punchti.me";
          break;
        case 'logs':
          url = this._lastKnownTimer.boardUrl;
          break;
        case 'timer':
          if ((this._lastKnownTimer.isActive != null) && this._lastKnownTimer.isActive) {
            if (this._lastKnownTimer.card != null) {
              url = "https://trello.com/c/" + this._lastKnownTimer.card;
            } else {
              url = "https://trello.com/b/" + this._lastKnownTimer.board;
            }
          } else {
            url = "https://app.punchti.me";
          }
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        popup = window.open(url);
        popup.focus();
      }
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.application.activeBrowserWindow.openTab().url = url;
      }
    };

    PunchtimePopupPage.prototype.requestLogin = function() {
      this._sendMessage('requestLoginRelay', true);
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.self.hide();
      }
    };

    PunchtimePopupPage.prototype.startTimer = function() {
      return this._sendMessage('requestTimerStartRelay', true);
    };

    PunchtimePopupPage.prototype.addLog = function() {
      return this._sendMessage('requestLogAddRelay', true);
    };

    PunchtimePopupPage.prototype.toggleTimer = function() {
      return this._sendMessage('timer:toggle', true);
    };

    PunchtimePopupPage.prototype.resumeTimer = function() {
      return this._sendMessage('timer:resume', true);
    };

    PunchtimePopupPage.prototype.pauseTimer = function() {
      return this._sendMessage('timer:pause', true);
    };

    PunchtimePopupPage.prototype.cancelTimer = function() {
      return this._sendMessage('timer:cancel', true);
    };

    PunchtimePopupPage.prototype.commitTimer = function() {
      return this._sendMessage('timer:commit', true);
    };

    PunchtimePopupPage.prototype._updateDisplay = function() {
      var time;
      time = this._formatDuration();
      if (time[0] !== this._prevTime[0]) {
        $('.timer-time .left').html(time[0]);
      }
      if (time[1] !== this._prevTime[1]) {
        $('.timer-time .right').html(time[1]);
      }
      $('.timer-time .separator').toggleClass('hide', (this._lastKnownTimer.isRunning != null) && !this._lastKnownTimer.isRunning ? false : this._displayTick);
      this._displayTick = !this._displayTick;
      return this._prevTime = time;
    };

    PunchtimePopupPage.prototype._sendMessage = function(key, value) {
      if (typeof safari !== "undefined" && safari !== null) {
        safari.extension.globalPage.contentWindow.handleDirectMessage({
          name: key,
          message: value
        });
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        return chrome.runtime.sendMessage({
          message: key,
          value: value
        });
      }
    };

    PunchtimePopupPage.prototype._formatDuration = function() {
      var hours, minutes, s;
      if (this._lastKnownTimer.isActive) {
        s = this._lastKnownTimer.isRunning ? this._lastKnownTimer.savedDuration + parseInt((new Date().getTime() - this._lastKnownTimer.isRunningSince) / 1000) : this._lastKnownTimer.savedDuration;
      } else {
        s = 0;
      }
      if (s < 60) {
        hours = 0;
        minutes = s;
      } else {
        hours = parseInt(s / 3600);
        minutes = parseInt(s / 60) % 60;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (hours < 10) {
        hours = "0" + hours;
      }
      return [hours, minutes];
    };

    return PunchtimePopupPage;

  })();

  window.directMessage = function(message) {
    return $(window).trigger('pt:backgroundmessage', message);
  };

  document.addEventListener("DOMContentLoaded", function(event) {
    return window['puchtimePopupPage'] = new PunchtimePopupPage();
  });

}).call(this);
