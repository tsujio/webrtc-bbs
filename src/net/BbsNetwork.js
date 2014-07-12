(function() {
  var _ = require('underscore');
  var Chord = require('webrtcnet');
  var Request = require('./Request');
  var Response = require('./Response');
  var Utils = require('../utils/Utils');

  var BbsNetwork = function(config, onRequestReceivedCallback) {
    var self = this;

    if (!Utils.isValidNumber(config.requestMessageTimeout) ||
        config.requestMessageTimeout < 0) {
      config.requestMessageTimeout = 180000;
    }

    this._config = config;
    this._chord = new Chord(config, function(fromPeerId, message) {
      self._onMessageReceived(fromPeerId, message);
    });
    this._onRequestReceivedCallback = onRequestReceivedCallback;
    this._callbacks = {};
    this._state = 'initialized';
  };

  BbsNetwork.prototype = {
    createNetwork: function(callback) {
      var self = this;

      if (this.getState() !== 'initialized') {
        if (this.getState() === 'failed') {
          callback(null, new Error("Leave network at first."));
        } else {
          callback(null, new Error("Invalid state."));
        }
        return;
      }

      this._state = 'connecting';

      this._chord.create(function(peerId, error) {
        if (error) {
          self._state = 'failed';
        } else {
          self._state = 'connected';
        }
        callback(peerId, error);
      });
    },

    joinNetwork: function(bootstrapId, callback) {
      var self = this;

      if (this.getState() !== 'initialized') {
        if (this.getState() === 'failed') {
          callback(null, new Error("Leave network at first."));
        } else {
          callback(null, new Error("Invalid state."));
        }
        return;
      }

      this._state = 'connecting';

      this._chord.join(bootstrapId, function(peerId, error) {
        if (error) {
          self._state = 'failed';
        } else {
          self._state = 'connected';
        }
        callback(peerId, error);
      });
    },

    leaveNetwork: function() {
      this._chord.leave();
      this._state = 'initialized';
    },

    fetchThreads: function(excludeIds, callback) {
      this._sendRequest('RECENT', {excludeIds: excludeIds}, {
        success: function(result) {
          if (!_.isArray(result.threadsInfo)) {
            callback(null, new Error("Received invalid data."));
            return;
          }
          callback(result.threadsInfo);
        },

        error: function(error) {
          callback(null, error);
        }
      });
    },

    spreadThread: function(threadInfo) {
      this._sendRequest('NEW', {threadInfo: threadInfo});
    },

    fetchMessages: function(threadId, excludeIds, callback) {
      this._sendRequest('GET', {threadId: threadId, excludeIds: excludeIds}, {
        success: function(result) {
          if (!_.isArray(result.messagesInfo)) {
            callback(null, new Error("Received invalid data."));
            return;
          }
          callback(result.messagesInfo);
        },

        error: function(error) {
          callback(null, error);
        }
      });
    },

    spreadMessage: function(messageInfo) {
      this._sendRequest('UPDATE', {messageInfo: messageInfo});
    },

    insertEntry: function(key, value, callback) {
      if (this.getState() !== 'connected' &&
          this.getState() !== 'listening') {
        if (callback) {
          callback(new Error("Invalid state."));
        }
        return;
      }

      this._chord.insert(key, value, callback);
    },

    retrieveEntries: function(key, callback) {
      if (this.getState() !== 'connected' &&
          this.getState() !== 'listening') {
        if (callback) {
          callback(null, new Error("Invalid state."));
        }
        return;
      }

      this._chord.retrieve(key, callback);
    },

    removeEntry: function(key, value, callback) {
      if (this.getState() !== 'connected' &&
          this.getState() !== 'listening') {
        if (callback) {
          callback(new Error("Invalid state."));
        }
        return;
      }

      this._chord.remove(key, value, callback);
    },

    _sendRequest: function(method, params, callbacks) {
      var self = this;

      if (this.getState() !== 'connected') {
        if (callbacks) {
          callbacks.error(new Error("Invalid state."));
        }
        return
      }

      var request = Request.create(method, params);

      if (callbacks) {
        var timer = setTimeout(function() {
          delete self._callbacks[request.requestId];
          callbacks.error(new Error("Request timed out."));
        }, this._config.requestMessageTimeout);

        this._callbacks[request.requestId] = _.once(function(response) {
          clearTimeout(timer);

          if (response.status !== 'SUCCESS') {
            callbacks.error(new Error(response.message));
            return;
          }

          callbacks.success(response.result);
        });
      }

      Utils.debug("Sending request:", request.method);

      try {
       this._chord.sendMessage(null, request.toJson());
      } catch (e) {
        clearTimeout(timer);
        if (callbacks) {
          callbacks.error(e);
        }
      }
    },

    _onMessageReceived: function(fromPeerId, messageJson) {
      var self = this;

      if (Response.isResponse(messageJson)) {
        var response;
        try {
          response = Response.fromJson(messageJson);
        } catch (e) {
          cosole.log("Received invalid response from " + fromPeerId + ": " + e);
          return;
        }

        Utils.debug("Received response from", fromPeerId, ":", response.method);

        if (_.has(this._callbacks, response.requestId)) {
          var callback = this._callbacks[response.requestId];
          delete this._callbacks[response.requestId];
          callback(response);
        }
      } else if (Request.isRequest(messageJson)) {
        var request;
        try {
          request = Request.fromJson(messageJson);
        } catch (e) {
          cosole.log("Received invalid request from" + fromPeerId + ": " + e);
          return;
        }

        Utils.debug("Received request from", fromPeerId, ":", request.method);

        this._onRequestReceivedCallback(fromPeerId, request, function(response) {
          if (self.getState() !== 'connected') {
            return;
          }

          Utils.debug("Sending response to", fromPeerId, ":", response.method, "(", response.status, ")");

          self._chord.sendMessage(fromPeerId, response.toJson());
        });
      }
    },

    getPeerId: function() {
      try {
        return this._chord.getPeerId();
      } catch (e) {
        return "";
      }
    },

    getDirectConnectedPeers: function() {
      var statuses;
      try {
        statuses = this._chord.getStatuses();
      } catch (e) {
        return [];
      }

      return _.chain(statuses.successors)
        .concat([statuses.predecessor])
        .reject(function(peer) { return !peer; })
        .map(function(peer) { return peer.peerId; })
        .unique()
        .value();
    },

    getState: function() {
      if (this._state === 'connected' && _.isEmpty(this.getDirectConnectedPeers())) {
        return 'listening';
      }
      return this._state;
    }
  };

  module.exports = BbsNetwork;
})();
