
/*
 * Console.log facade with debug flag
 */

(function() {
  var PunchtimeAPIBridge, PunchtimeLogger, PunchtimeTimerFacade,
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
   * Helper class that bridges connections to the Punchtime and Trello APIs
   */

  PunchtimeAPIBridge = (function(_super) {
    __extends(PunchtimeAPIBridge, _super);

    PunchtimeAPIBridge.prototype._debug = false;

    PunchtimeAPIBridge.prototype._endpoint = 'https://api.punchti.me/api/v1';

    PunchtimeAPIBridge.prototype._loggedIn = null;

    PunchtimeAPIBridge.prototype._currentBoard = null;

    PunchtimeAPIBridge.prototype._previousBoard = null;

    PunchtimeAPIBridge.prototype._currentCard = null;

    PunchtimeAPIBridge.prototype._ptApiParams = {};

    PunchtimeAPIBridge.prototype._queuedBoard = null;

    PunchtimeAPIBridge.prototype._queuedCard = null;

    PunchtimeAPIBridge.prototype._boardUpdateInterval = null;

    PunchtimeAPIBridge.prototype._loginInterval = null;

    PunchtimeAPIBridge.prototype._updateIntervalDuration = 5 * 60 * 1000;

    function PunchtimeAPIBridge() {
      this._debug = window.PunchtimeDebug || false;
      this.l('-> starting Punchtime API bridge');
      Trello.setKey('13b271012411a7cace77b9a635288e6d');
      if (typeof safari !== "undefined" && safari !== null) {
        safari.self.addEventListener("message", (function(_this) {
          return function(e) {
            if (e.name === "updateTokenFromSettings") {
              return _this.gotTokenFromSettings(e);
            }
          };
        })(this), false);
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.runtime.onMessage.addListener((function(_this) {
          return function(request, sender, sendResponse) {
            if (request.message === 'updateTokenFromSettings') {
              sendResponse({
                received: true
              });
              return _this.gotTokenFromSettings(request);
            }
          };
        })(this));
      }
      this.fetchTokenFromSettings();
    }

    PunchtimeAPIBridge.prototype.invalidateBoardUpdateInterval = function() {
      if (this._boardUpdateInterval != null) {
        this.l('-> Canceling board update timer');
        window.clearInterval(this._boardUpdateInterval);
        return this._boardUpdateInterval = null;
      }
    };

    PunchtimeAPIBridge.prototype.clearBoard = function() {
      this._previousBoard = null;
      this._currentBoard = null;
      this._currentCard = null;
      return this.invalidateBoardUpdateInterval();
    };

    PunchtimeAPIBridge.prototype.fetchTokenFromSettings = function() {
      this.l('-> fetching a token from settings');
      if (typeof safari !== "undefined" && safari !== null) {
        safari.self.tab.dispatchMessage("getTokenFromSettings");
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        return chrome.runtime.sendMessage({
          message: "getTokenFromSettings"
        });
      }
    };

    PunchtimeAPIBridge.prototype.gotTokenFromSettings = function(e) {
      this.l('-> received a token response');
      if (typeof safari !== "undefined" && safari !== null) {
        if ((e.message != null) && e.message.length > 0) {
          this._ptApiParams = {
            token: e.message
          };
          this.fetchPunchtimeUser();
        } else {
          this.setLoggedIn(false);
        }
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        if ((e.token != null) && e.token.length > 0) {
          this._ptApiParams = {
            token: e.token
          };
          return this.fetchPunchtimeUser();
        } else {
          return this.setLoggedIn(false);
        }
      }
    };

    PunchtimeAPIBridge.prototype.refresh = function() {
      this.l('-> refreshing current data');
      if (this._currentBoard != null) {
        if (this._currentBoard.card_log_duration != null) {
          return this.loadBoardFromCurrentCard();
        } else {
          return this.loadBoard(this._currentBoard.trello_id);
        }
      }
    };

    PunchtimeAPIBridge.prototype.loadBoard = function(id) {
      if (!this._loggedIn) {
        this.l('-> Delaying board load because not logged in');
        this._queuedBoard = id;
        this._queuedCard = null;
        return;
      }
      return $.getJSON("" + this._endpoint + "/boards/" + id, this._ptApiParams).done((function(_this) {
        return function(data) {
          _this.setLoggedIn(true);
          _this.l('-> Fetched a board');
          _this._previousBoard = _this._currentBoard;
          _this._currentBoard = data;
          $('body').toggleClass('pt-board-loaded', true);
          return $(window).trigger('pt:boardloaded');
        };
      })(this)).fail((function(_this) {
        return function(e) {
          _this.l('X: Failed to fetch board', e);
          if (e.status === 404) {
            return $('body').toggleClass('pt-board-loaded', false);
          } else {
            return _this.setLoggedIn(false);
          }
        };
      })(this)).always((function(_this) {
        return function() {
          if (_this._boardUpdateInterval == null) {
            _this.l('-> Set board update timers');
            return _this._boardUpdateInterval = window.setInterval(function() {
              return _this.loadBoard(_this._currentBoard.trello_id);
            }, _this._updateIntervalDuration);
          }
        };
      })(this));
    };

    PunchtimeAPIBridge.prototype.loadBoardFromCurrentCard = function() {
      return $.getJSON("" + this._endpoint + "/boards/" + this._currentCard.board.shortLink + "/with_card_duration/" + this._currentCard.idShort, this._ptApiParams).done((function(_this) {
        return function(data) {
          _this.setLoggedIn(true);
          _this.l('-> Fetched a board with card details');
          _this._previousBoard = _this._currentBoard;
          _this._currentBoard = data;
          $('body').toggleClass('pt-card-loaded', true);
          $(window).trigger('pt:boardloaded', _this._currentCard.board.shortLink);
          return $(window).trigger('pt:cardloaded');
        };
      })(this)).fail((function(_this) {
        return function() {
          _this.l('X: Failed to fetch board with card details');
          if (e.status === 404) {
            return $('body').toggleClass('pt-card-loaded', false);
          } else {
            return _this.setLoggedIn(false);
          }
        };
      })(this)).always((function(_this) {
        return function() {
          if (_this._boardUpdateInterval == null) {
            _this.l('-> Set board update timers');
            return _this._boardUpdateInterval = window.setInterval(function() {
              return _this.loadBoardFromCurrentCard();
            }, _this._updateIntervalDuration);
          }
        };
      })(this));
    };

    PunchtimeAPIBridge.prototype.boardDurationChanged = function() {
      return (this._previousBoard != null) && (this._currentBoard != null) && this._previousBoard.total_log_duration !== this._currentBoard.total_log_duration;
    };

    PunchtimeAPIBridge.prototype.loadCard = function(id) {
      $('body').toggleClass('pt-card-loaded', false);
      if (!this._loggedIn) {
        this.l('-> Delaying card load because not logged in');
        this._queuedCard = id;
        this._queuedBoard = null;
        return;
      }
      return Trello.cards.get(id, {
        board: true,
        board_fields: 'shortLink'
      }, (function(_this) {
        return function(card) {
          _this.l('-> Fetched card details from Trello');
          _this._currentCard = card;
          _this.invalidateBoardUpdateInterval();
          return _this.loadBoardFromCurrentCard();
        };
      })(this), (function(_this) {
        return function(error) {
          _this.l('X: Failed to fetch card from Trello');
          return _this.l(error);
        };
      })(this));
    };

    PunchtimeAPIBridge.prototype.getBoardDuration = function() {
      var s;
      if (this._currentBoard != null) {
        s = this._currentBoard.total_log_duration;
        return this.formatDuration(s);
      } else {
        return this.formatDuration(0);
      }
    };

    PunchtimeAPIBridge.prototype.getCardDuration = function() {
      var s;
      if ((this._currentBoard != null) && (this._currentBoard.card_log_duration != null)) {
        s = this._currentBoard.card_log_duration;
        return this.formatDuration(s);
      } else {
        return this.formatDuration(0);
      }
    };

    PunchtimeAPIBridge.prototype.formatDuration = function(s) {
      var hours, minutes;
      hours = parseInt(s / 3600);
      minutes = parseInt(s / 60) % 60;
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      return "" + hours + ":" + minutes + "&thinsp;<span class='pt-hour'>h</span>";
    };

    PunchtimeAPIBridge.prototype.getBoardUrl = function() {
      if (this._currentBoard != null) {
        return this._currentBoard.punchtime_url;
      } else {
        return false;
      }
    };

    PunchtimeAPIBridge.prototype.fetchPunchtimeUser = function() {
      this.l('-> fetching punchtime user');
      return $.getJSON("" + this._endpoint + "/user", this._ptApiParams).done((function(_this) {
        return function(data) {
          _this.l('-> Logged in with Punchtime');
          Trello.setToken(data.access_token_as_string);
          return _this.setLoggedIn(true);
        };
      })(this)).fail((function(_this) {
        return function() {
          _this.l('X: Not logged in on Punchtime');
          return _this.setLoggedIn(false);
        };
      })(this));
    };

    PunchtimeAPIBridge.prototype.setLoggedIn = function(newState) {
      if (this._loggedIn !== newState) {
        this._loggedIn = newState;
        $('body').toggleClass('pt-signedin', newState);
        $('body').toggleClass('pt-notsignedin', !newState);
        $(window).trigger('pt:loginstatechanged', {
          loggedIn: newState
        });
        if (this._loggedIn) {
          window.clearInterval(this._loginInterval);
          if (this._queuedCard != null) {
            this.loadCard(this._queuedCard);
            this._queuedCard = null;
          }
          if (this._queuedBoard != null) {
            this.loadBoard(this._queuedBoard);
            return this._queuedBoard = null;
          }
        } else {
          $('body').toggleClass('pt-card-loaded', false);
          return this._loginInterval = window.setInterval((function(_this) {
            return function() {
              return _this.fetchPunchtimeUser();
            };
          })(this), this._updateIntervalDuration);
        }
      }
    };

    PunchtimeAPIBridge.prototype.isLoggedIn = function() {
      return this._loggedIn;
    };

    PunchtimeAPIBridge.prototype.currentShortId = function(url) {
      var parser;
      if (url == null) {
        url = window.location.href;
      }
      parser = document.createElement('a');
      parser.href = url;
      return parser.pathname.split('/')[2];
    };

    return PunchtimeAPIBridge;

  })(PunchtimeLogger);

  PunchtimeTimerFacade = (function(_super) {
    __extends(PunchtimeTimerFacade, _super);

    PunchtimeTimerFacade.prototype._debug = false;

    PunchtimeTimerFacade.prototype._initialized = false;

    PunchtimeTimerFacade.prototype._chromeStorageStrategy = 'sync';

    PunchtimeTimerFacade.prototype._timer = {};

    function PunchtimeTimerFacade() {
      this._debug = window.PunchtimeDebug || false;
      if (typeof chrome !== "undefined" && chrome !== null) {
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
        safari.self.addEventListener("message", (function(_this) {
          return function(e) {
            if (e.name === 'timer:changed' || e.name === "timer:state") {
              return _this.handleTimerChange(e.message);
            }
          };
        })(this), false);
        this._sendMessage('timer:emitstate', true);
      }
    }

    PunchtimeTimerFacade.prototype.startTimer = function(board, card) {
      if (board == null) {
        board = null;
      }
      if (card == null) {
        card = null;
      }
      this.l('-> Starting timer (facade)');
      return this._sendMessage('timer:start', {
        board: board,
        card: card
      });
    };

    PunchtimeTimerFacade.prototype.handleTimerChange = function(newTimer) {
      this._timer = newTimer;
      return $('body').toggleClass('pt-timer-active', this._timer.isActive);
    };

    PunchtimeTimerFacade.prototype._sendMessage = function(key, value) {
      if (typeof safari !== "undefined" && safari !== null) {
        safari.self.tab.dispatchMessage(key, value);
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        return chrome.runtime.sendMessage({
          message: key,
          value: value
        });
      }
    };

    return PunchtimeTimerFacade;

  })(PunchtimeLogger);


  /*
   * Main class manages integration of PT in Trello
   */

  window.PunchtimeTrello = (function(_super) {
    __extends(PunchtimeTrello, _super);

    PunchtimeTrello.prototype._stateObserver = null;

    PunchtimeTrello.prototype._debug = false;

    PunchtimeTrello.prototype._baseUrl = 'https://app.punchti.me';

    PunchtimeTrello.prototype._currentBoard = null;

    PunchtimeTrello.prototype._currentCard = null;

    PunchtimeTrello.prototype._currentState = 1;

    PunchtimeTrello.prototype._trelloReady = false;

    PunchtimeTrello.prototype._stateMutationTimer = null;

    PunchtimeTrello.prototype._stateMutationDebounceDuration = 250;

    PunchtimeTrello.prototype.c = null;

    PunchtimeTrello.prototype.t = null;

    function PunchtimeTrello() {
      var l;
      this._debug = window.PunchtimeDebug || false;
      this.l('-> Starting Punctime integration');
      l = document.createElement("a");
      l.href = document.location.href;
      if (l.hostname !== 'trello.com') {
        $('html').addClass('pt-extension-loaded');
        $(window).on('hashchange', (function(_this) {
          return function(e) {
            if (document.location.hash === '#timer-added') {
              return safari.self.tab.dispatchMessage("logAddedFromPopup");
            }
          };
        })(this));
      }
      if (typeof safari !== "undefined" && safari !== null) {
        safari.self.addEventListener("message", (function(_this) {
          return function(e) {
            return _this.safariReceiveMessage(e);
          };
        })(this), false);
        safari.self.tab.dispatchMessage("setScriptWindow");
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.runtime.onMessage.addListener((function(_this) {
          return function(q, s, r) {
            return _this.chromeReceiveMessage(q, s, r);
          };
        })(this));
      }
      this.t = new PunchtimeTimerFacade();
      if (l.hostname !== 'trello.com') {
        return;
      }
      this.c = new PunchtimeAPIBridge();
      $(document).on('click', '.js-pt-view-logs', (function(_this) {
        return function(e) {
          return _this.handleViewLogs();
        };
      })(this));
      $(document).on('click', '.js-pt-view-insights', (function(_this) {
        return function(e) {
          return _this.handleViewInsights();
        };
      })(this));
      $(document).on('click', '.js-pt-add-log', (function(_this) {
        return function(e) {
          return _this.handleAddLog(false);
        };
      })(this));
      $(document).on('click', '.js-pt-sign-in', (function(_this) {
        return function(e) {
          return _this.handleSignIn(e);
        };
      })(this));
      $(document).on('click', '.js-pt-close-config', (function(_this) {
        return function(e) {
          return _this.handleCloseConfigUI();
        };
      })(this));
      $(document).on('click', '.js-pt-commit-config', (function(_this) {
        return function(e) {
          return _this.handleCommitConfigUI(e);
        };
      })(this));
      $(document).on('click', '.js-pt-view-card-logs', (function(_this) {
        return function(e) {
          return _this.handleViewCardLogs();
        };
      })(this));
      $(document).on('click', '.js-pt-view-card-insights', (function(_this) {
        return function(e) {
          return _this.handleViewCardInsights();
        };
      })(this));
      $(document).on('click', '.js-pt-add-card-log', (function(_this) {
        return function(e) {
          console.log(e, _this);
          return _this.handleAddLog(true);
        };
      })(this));
      $(document).on('click', '.js-pt-start-timer', (function(_this) {
        return function(e) {
          return _this.handleStartTimer();
        };
      })(this));
      $(window).on('pt:boardloaded', (function(_this) {
        return function(e, data) {
          return _this.handleBoardLoaded(e, data);
        };
      })(this));
      $(window).on('pt:cardloaded', (function(_this) {
        return function(e) {
          return _this.handleCardLoaded(e);
        };
      })(this));
      $(window).on('pt:loginstatechanged', (function(_this) {
        return function(e, data) {
          return _this.handleLoginStateChanged(e, data);
        };
      })(this));
      this.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver || null;
      this.startStateObserver();
      this.stateDidMutate();
    }

    PunchtimeTrello.prototype.safariReceiveMessage = function(event) {
      switch (event.name) {
        case "updateCurrentBoard":
          return this.c.refresh();
        case "requestPageReady":
          return this.handleRequestPageReady();
        case "requestPunchtimePageReady":
          return this.handleRequestPunchtimePageReady();
        case "requestLogin":
          return this.handleSignIn();
        case "requestTimerStart":
          return this.handleStartTimer();
        case "requestLogAdd":
          return this.handleAddLog(this.checkIsCardOpen());
      }
    };

    PunchtimeTrello.prototype.chromeReceiveMessage = function(request, sender, sendResponse) {
      if (request.message != null) {
        switch (request.message) {
          case "updateCurrentBoard":
            return this.c.refresh();
          case "requestPageReady":
            return this.handleRequestPageReady();
          case "requestPunchtimePageReady":
            return this.handleRequestPunchtimePageReady();
          case "requestLogin":
            return this.handleSignIn();
          case "requestTimerStart":
            return this.handleStartTimer();
          case "requestLogAdd":
            return this.handleAddLog(this.checkIsCardOpen());
        }
      }
    };

    PunchtimeTrello.prototype.handleRequestPunchtimePageReady = function() {
      if ($('.js-enable-ext-timer').length > 0) {
        return this.sendPunchtimePageReady();
      }
    };

    PunchtimeTrello.prototype.handleRequestPageReady = function() {
      if (this.c._loggedIn === false) {
        return this.sendTrelloPageNotLoggedIn();
      } else {
        if (this._trelloReady) {
          return this.sendTrelloPageReady();
        }
      }
    };

    PunchtimeTrello.prototype.sendTrelloPageReady = function() {
      this._trelloReady = true;
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.runtime.sendMessage({
          message: "trelloPageReady"
        });
      }
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.self.tab.dispatchMessage("trelloPageReady", true);
      }
    };

    PunchtimeTrello.prototype.sendPunchtimePageReady = function() {
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.runtime.sendMessage({
          message: "punchtimePageReady"
        });
      }
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.self.tab.dispatchMessage("punchtimePageReady", true);
      }
    };

    PunchtimeTrello.prototype.sendTrelloPageNotLoggedIn = function() {
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.runtime.sendMessage({
          message: "trelloPageNotLoggedIn"
        });
      }
      if (typeof safari !== "undefined" && safari !== null) {
        return safari.self.tab.dispatchMessage("trelloPageNotLoggedIn", true);
      }
    };

    PunchtimeTrello.prototype.handleStartTimer = function() {
      var l;
      l = document.createElement("a");
      l.href = document.location.href;
      if (l.hostname === 'trello.com') {
        if (this.checkIsCardOpen()) {
          return this.t.startTimer(this.c._currentBoard, {
            shortId: this.c.currentShortId(this.c._currentCard.url),
            shortCode: this.c._currentCard.idShort,
            name: this.c._currentCard.name
          });
        } else {
          return this.t.startTimer(this.c._currentBoard);
        }
      } else {
        return this.t.startTimer({
          trello_id: $('#board_name').data('board-id'),
          name: $('#board_name').data('board-name'),
          punchtime_url: $('#board_name').data('board-url')
        });
      }
    };

    PunchtimeTrello.prototype.handleLoginStateChanged = function(e, data) {
      this.l('-> Loginstate changed');
      if (!data.loggedIn) {
        return this.sendTrelloPageNotLoggedIn();
      }
    };

    PunchtimeTrello.prototype.handleAddLog = function(forCard, defaultDuration, forTimer) {
      var url;
      if (forCard == null) {
        forCard = false;
      }
      if (defaultDuration == null) {
        defaultDuration = 0;
      }
      if (forTimer == null) {
        forTimer = false;
      }
      this.l('-> Opening add popup', forCard, defaultDuration, forTimer);
      url = "" + (this.c.getBoardUrl()) + "/extension_log?";
      if (typeof safari !== "undefined" && safari !== null) {
        safari.self.tab.dispatchMessage("performLogAdd", {
          board: this.c._currentBoard,
          card: (forCard ? this.c._currentCard : null)
        });
        return;
      }
      if (forCard) {
        url += "description=%23" + this.c._currentBoard.card_id + "&";
      }
      if (forTimer) {
        url += "duration=" + defaultDuration + "&";
        url += "timer=1&";
      }
      if ((this.c._ptApiParams.token != null) && this.c._ptApiParams.token.length > 0) {
        url += "token=" + this.c._ptApiParams.token;
      }
      return this.openLogAddLogPopup(url);
    };

    PunchtimeTrello.prototype.openLogAddLogPopup = function(url) {
      var h, left, popup, top, w;
      w = Math.min(800, screen.width);
      h = 360;
      left = (screen.width / 2) - (w / 2);
      top = (screen.height / 2) - (h / 2);
      popup = window.open(url, "add_log", "width=" + w + ", height=" + h + ", left=" + left + ", top=" + top + ", toolbar=no, menubar=no, scrollbars=no, location=no, personalbar=no, status=no");
      popup.focus();
      if (typeof chrome !== "undefined" && chrome !== null) {
        return chrome.runtime.sendMessage({
          message: "addLogPopupOpened"
        });
      }
    };

    PunchtimeTrello.prototype.handleSignIn = function() {
      return this.injectConfigUI();
    };

    PunchtimeTrello.prototype.handleCloseConfigUI = function() {
      return this.clearConfigUI();
    };

    PunchtimeTrello.prototype.handleCommitConfigUI = function(event) {
      var new_token;
      event.preventDefault();
      new_token = $('#pt-access-token').val();
      if (typeof safari !== "undefined" && safari !== null) {
        safari.self.tab.dispatchMessage("setTokenToSettings", {
          token: new_token
        });
      }
      if (typeof chrome !== "undefined" && chrome !== null) {
        chrome.runtime.sendMessage({
          message: "setTokenToSettings",
          token: new_token
        });
      }
      return this.clearConfigUI();
    };

    PunchtimeTrello.prototype.handleViewCardLogs = function() {
      var url;
      if (this.c.getBoardUrl()) {
        url = encodeURI(this.c.getBoardUrl() + ("?filters[current_card]=" + this.c._currentBoard.card_id));
        if ((this.c._ptApiParams.token != null) && this.c._ptApiParams.token.length > 0) {
          url += "&token=" + this.c._ptApiParams.token;
        }
        return window.open(url);
      }
    };

    PunchtimeTrello.prototype.handleViewCardInsights = function() {
      var url;
      if (this.c.getBoardUrl()) {
        url = encodeURI(this.c.getBoardUrl() + "/insights" + ("?filters[current_card]=" + this.c._currentBoard.card_id));
        if ((this.c._ptApiParams.token != null) && this.c._ptApiParams.token.length > 0) {
          url += "&token=" + this.c._ptApiParams.token;
        }
        return window.open(url);
      }
    };

    PunchtimeTrello.prototype.handleViewLogs = function() {
      var url;
      if (this.c.getBoardUrl()) {
        url = this.c.getBoardUrl();
        if ((this.c._ptApiParams.token != null) && this.c._ptApiParams.token.length > 0) {
          url += "?token=" + this.c._ptApiParams.token;
        }
        return window.open(url);
      }
    };

    PunchtimeTrello.prototype.handleViewInsights = function() {
      var url;
      if (this.c.getBoardUrl()) {
        url = this.c.getBoardUrl() + "/insights";
        if ((this.c._ptApiParams.token != null) && this.c._ptApiParams.token.length > 0) {
          url += "?token=" + this.c._ptApiParams.token;
        }
        return window.open(url);
      }
    };

    PunchtimeTrello.prototype.handleBoardLoaded = function(e, boardId) {
      var b;
      this.sendTrelloPageReady();
      if (boardId) {
        this._currentBoard = boardId;
      }
      b = document.querySelector('.js-pt-board-duration');
      if (b != null) {
        b.innerHTML = this.c.getBoardDuration();
        if (this.c.boardDurationChanged()) {
          $('body').addClass('duration-updated');
          return window.setTimeout(function() {
            return $('body').removeClass('duration-updated');
          }, 2500);
        }
      }
    };

    PunchtimeTrello.prototype.handleCardLoaded = function(e) {
      var b;
      this.sendTrelloPageReady();
      b = document.querySelector('.js-pt-card-duration');
      if (b != null) {
        return b.innerHTML = this.c.getCardDuration();
      }
    };

    PunchtimeTrello.prototype.startStateObserver = function() {
      var observerConfig;
      this.l('-> Initializing state observer');
      observerConfig = {
        childList: true,
        characterData: false,
        attributes: true,
        subtree: true
      };
      this._stateObserver = new this.MutationObserver((function(_this) {
        return function(mutations) {
          return _this.stateDidMutate(mutations);
        };
      })(this));
      return this._stateObserver.observe(document.body, observerConfig);
    };

    PunchtimeTrello.prototype.stateDidMutate = function(mutations) {
      if (this._stateMutationTimer != null) {
        window.clearTimeout(this._stateMutationTimer);
        this._stateMutationTimer = null;
      }
      return this._stateMutationTimer = window.setTimeout((function(_this) {
        return function() {
          return _this.checkTrelloState();
        };
      })(this), this._stateMutationDebounceDuration);
    };

    PunchtimeTrello.prototype.checkTrelloState = function() {
      if (this.checkIsBoardPage()) {
        if ($('body').hasClass('pt-show-config-ui' && (document.querySelector('.pt-config-ui') == null))) {
          this.injectConfigUI();
        }
        if ((document.querySelector('.board-widgets .board-widget-punchtime') == null) || (document.querySelector('.header-widget-punchtime') == null)) {
          this.injectBoardUI();
        }
        if (this.checkIsCardOpen()) {
          if (!document.querySelector('.js-pt-view-card-logs')) {
            this.injectCardUI();
          }
          if (this._currentCard !== this.c.currentShortId()) {
            this._currentCard = this.c.currentShortId();
            this.l('-> On a card we did not know about');
            this._trelloReady = false;
            return this.c.loadCard(this._currentCard);
          } else {
            return this.l('-> On a card we knew about');
          }
        } else if (this.checkIsBoardOpen()) {
          if (this._currentBoard !== this.c.currentShortId()) {
            this.l('-> Unloading board');
            this._trelloReady = false;
            this.unloadBoard();
            if (typeof safari !== "undefined" && safari !== null) {
              safari.self.tab.dispatchMessage("closePopups");
            }
            if (typeof chrome !== "undefined" && chrome !== null) {
              chrome.runtime.sendMessage({
                message: "closePopups"
              });
            }
            this._currentBoard = this.c.currentShortId();
            this.l('-> On a board we did not know about', this._currentBoard);
            return this.c.loadBoard(this._currentBoard);
          } else {
            return this.l('-> On a board we knew about', this._currentBoard);
          }
        }
      } else {
        this.l('-> Not on a board page');
        this._trelloReady = false;
        return this.unloadBoard();
      }
    };

    PunchtimeTrello.prototype.unloadBoard = function() {
      if ((this._currentBoard != null) || (this._currentCard != null)) {
        this.l('-> Unloading a board');
      }
      this._currentBoard = null;
      this._currentCard = null;
      return this.c.clearBoard();
    };

    PunchtimeTrello.prototype.checkIsBoardPage = function() {
      return document.querySelector('#surface .board-wrapper') !== null;
    };

    PunchtimeTrello.prototype.checkIsBoardOpen = function() {
      if (window.location.href.indexOf("/b/") !== -1) {
        return true;
      } else {
        return false;
      }
    };

    PunchtimeTrello.prototype.checkIsCardOpen = function() {
      if (window.location.href.indexOf("/c/") !== -1) {
        return true;
      } else {
        return false;
      }
    };

    PunchtimeTrello.prototype.clearConfigUI = function() {
      return document.location.reload();
    };

    PunchtimeTrello.prototype.injectConfigUI = function() {
      $('body').addClass('pt-show-config-ui window-up');
      if (document.querySelector('.pt-config-ui') == null) {
        return this.insertNodesFromString("<div class=\"window-overlay pt-config-ui\">\n  <div class=\"window\" style=\"display: block; width: 550px;\"> \n    <a class=\"focus-dummy\" href=\"#\"></a> \n    <div class=\"window-wrapper clearfix js-tab-parent\">\n      <a class=\"icon-lg icon-close dialog-close-button js-pt-close-config\" href=\"#\" title=\"Close this dialog window.\"></a> \n      <div class=\"clearfix\">\n      \n        <div class=\"window-header clearfix\">\n          <span class=\"window-header-icon icon-lg\" data-icon=\";\" style=\"font-size: 30px;\"></span>\n          <div class=\"window-title card-detail-title non-empty inline\" attr=\"name\"> \n            <h2 class=\"window-title-text current hide-on-edit js-card-title\">\n              Welcome to the Punchtime Browser Extension\n            </h2>\n          </div>\n        </div>\n          \n        <div class=\"pt-config-list markeddown\">\n          <hr>\n          <div class=\"pt-config-list-item\">\n            <h3>1. Don't have a Punchtime account yet?</h3>\n            <p>\n              No problem, you can sign up now &mdash; it's free. After signing up, proceed to the next step.\n            </p>\n            <a target=\"_blank\" href=\"" + this._baseUrl + "\" class=\"button-link\">\n              Sign up for Punchtime\n            </a>\n          </div>\n          \n          <div class=\"pt-config-list-item\">\n            <h3>2. Copy your Punchtime access token</h3>\n            <p>\n              The browser extension needs your Punchtime token to work. Click the button to view your\n              Punchtime account. You can find the token at the very bottom of the page. Copy it and come back here.\n            </p>\n            <a target=\"_blank\" href=\"" + this._baseUrl + "/account/edit#access-token\" class=\"button-link\">\n              View your Punchtime account\n            </a>\n          </div>\n          \n          <div class=\"pt-config-list-item\">\n            <h3>3. Paste in your token</h3>\n            <p>\n              Almost there! Now paste the token you just copied into the box below.\n            </p>\n            <input type=\"text\" id=\"pt-access-token\" name=\"pt-access-token\" style=\"display: inline-block; float: left;\">\n            <a href=\"#\" class=\"button-link primary js-pt-commit-config\" style=\"display: inline-block; margin-top: 0; margin-left: 10px;\">\n              Done\n            </a>\n          </div>\n          \n          <div class=\"pt-config-list-item\">\n            <h3>Need more help?</h3>\n            <p>\n              No worries, check out this <a target=\"_blank\" href=\"http://punchtime.uservoice.com/knowledgebase/articles/462745\">step-by-step guide</a>.\n            </p>\n          </div>\n              \n        </div>\n      <div>\n    </div>\n  </div>\n</div>", '.pop-over');
      }
    };

    PunchtimeTrello.prototype.injectBoardUI = function() {
      if (document.querySelector('.board-widget.board-widget-punchtime') == null) {
        this.insertNodesFromString("<div class=\"board-widget board-widget-punchtime clearfix pt-show-if-own\">\n  <div class=\"board-widget\">\n    <div class=\"board-widget-title\">\n      <h3>Punchtime</h3>\n    </div>\n    <div class=\"board-widget-content\">\n      \n      <span class=\"pt-show-loading\">\n        <span class=\"spinner small inline-block\"></span> \n        Loading&hellip;\n      </span>\n    \n      <span class=\"pt-hide-signedin\">\n        <a target=\"_blank\" href=\"#\" class=\"button-link js-pt-sign-in\">\n          <span class=\"icon-sm icon-gear\"></span>\n          Sign in to enable\n        </a>\n      </span>\n      \n      <span class=\"pt-show-board-loaded pt-show-card-loaded\">\n        <a href=\"#\" class=\"button-link js-pt-add-log\" title=\"Add a log to this board.\">\n          <span class=\"icon-sm icon-add\"></span>\n          Add log\n        </a>\n        \n        <a href=\"#\" class=\"button-link js-pt-view-logs\" title=\"View Punchtime logs for this board.\">\n          <span class=\"icon-sm icon-description\"></span>\n          View logs\n        </a>\n      </span>\n      \n    </div>\n  </div>\n  <hr>\n</div>", '.board-widget.board-widget--activity');
      }
      if (document.querySelector('.header-widget-punchtime') == null) {
        return this.insertNodesFromString("<span class=\"pt-show-board-loaded pt-show-card-loaded\">\n  <a href=\"#\" class=\"board-header-btn header-widget-punchtime js-pt-view-logs\" title=\"The total time logged on this board with Punchtime.\">\n    <span class=\"board-header-btn-icon icon-sm icon-pt-header\" data-icon=\";\"></span>\n    <span class=\"board-header-btn-text\">\n      <span class=\"js-pt-board-duration\">" + (this.c.getBoardDuration()) + "</span>\n    </span>\n  </a>\n</span>", '.board-header-btns.mod-right');
      }
    };

    PunchtimeTrello.prototype.injectCardUI = function() {
      if (document.querySelector('.js-pt-view-card-logs') == null) {
        this.insertNodesFromString("<div class=\"window-module punchtime-actions clearfix pt-show-card-loaded\">\n  <h3>Punchtime</h3>\n  <div class=\"clearfix\"> \n  \n    <a class=\"button-link js-pt-add-card-log\">\n      <span class=\"icon-sm icon-add\"></span>\n      Add log\n    </a>\n    <a class=\"button-link js-pt-view-card-logs\">\n      <span class=\"icon-sm icon-description\"></span>\n      View logs\n    </a>\n  </div>\n</div>", '.window-overlay .window-module.other-actions');
      }
      if (document.querySelector('.card-detail-item-punchtime') == null) {
        return this.insertNodesFromString("<div class=\"card-detail-item card-detail-item-punchtime clearfix pt-show-card-loaded\">\n  <h3 class=\"card-detail-item-header\">\n    Punchtime\n  </h3>\n  \n  <div class=\"js-card-detail-punchtime clearfix\" title=\"The time logged on this card with Punchtime.\">\n    <span class=\"punchtime-card-time js-pt-view-card-logs\">\n      <span class=\"js-pt-card-duration\">" + (this.c.getCardDuration()) + "</span>\n    </span>\n  </div>\n</div>\n", '.card-detail-item-labels');
      }
    };

    PunchtimeTrello.prototype.insertNodesFromString = function(str, beforeSelector) {
      var i, insertionPoint, node, nodes, _i, _ref, _results;
      insertionPoint = document.querySelector(beforeSelector);
      nodes = this.nodesFromString(str);
      _results = [];
      for (i = _i = 0, _ref = nodes.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        node = nodes.item(i);
        if (node === null || node.nodeType === 8 || node.nodeType === 3 || (insertionPoint == null)) {
          continue;
        }
        _results.push(insertionPoint.parentNode.insertBefore(node, insertionPoint));
      }
      return _results;
    };

    PunchtimeTrello.prototype.nodesFromString = function(str) {
      var container;
      container = document.createElement('div');
      container.innerHTML = str;
      return container.childNodes;
    };

    return PunchtimeTrello;

  })(PunchtimeLogger);

  $(function() {
    window.PunchtimeDebug = false;
    return new window.PunchtimeTrello();
  });

}).call(this);
