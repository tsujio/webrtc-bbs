define([
  'underscore', 'cryptojs', 'net/Request', 'net/Response', 'utils/Utils'
], function(_, CryptoJS, Request, Response, Utils) {
  var BbsNetwork = function(config, onRequestReceivedCallback) {
    var self = this;

    if (!Utils.isValidNumber(config.requestMessageTimeout) ||
        config.requestMessageTimeout < 0) {
      config.requestMessageTimeout = 180000;
    }

    this._config = config;
    this._worker = new Worker('./js/net/NetworkWorker.js');
    this._onRequestReceivedCallback = onRequestReceivedCallback;
    this._requestCallbacks = {};
    this._callbacks = {};
    this._state = 'initialized';

    this._worker.addEventListener('message', function(e) {
      var data = e.data;
      switch (data.cmd) {
      case 'message':
        self._onMessageReceived(data.params.fromPeerId, data.params.message);
        break;

      default:
        if (_.has(self._callbacks, data.id)) {
          var callback = self._callbacks[data.id];
          delete self._callbacks[data.id];
          callback(data.params);
        }
      }
    });

    var id = this._registerCallback(function(params) {
    });

    this._worker.postMessage({
      cmd: 'initialize',
      id: id,
      params: {
        config: config
      }
    });
  };

  BbsNetwork.prototype = {
    createNetwork: function(callback) {
      var self = this;

      this._state = 'connecting';

      var id = this._registerCallback(function(params) {
        if (params.error) {
          self._state = 'failed';
          callback(null, new Error(params.error));
        } else {
          self._state = 'connected';
          callback(params.peerId);
        }
      });

      this._worker.postMessage({
        cmd: 'create',
        id: id
      });
    },

    joinNetwork: function(bootstrapId, callback) {
      var self = this;

      this._state = 'connecting';

      var id = this._registerCallback(function(params) {
        if (params.error) {
          self._state = 'failed';
          callback(null, new Error(error));
        } else {
          self._state = 'connected';
          callback(params.peerId);
        }
      });

      this._worker.postMessage({
        cmd: 'join',
        id: id,
        params: {
          bootstrapId: bootstrapId
        }
      });
    },

    leaveNetwork: function() {
      this._worker.postMessage({
        cmd: 'leave'
      });
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
      var id = this._registerCallback(function(params) {
        if (params.error) {
          callback(new Error(params.error));
        } else {
          callback();
        }
      });

      this._worker.postMessage({
        cmd: 'insert',
        id: id,
        params: {
          key: key,
          value: value
        }
      });
    },

    retrieveEntries: function(key, callback) {
      var id = this._registerCallback(function(params) {
        if (params.error) {
          callback(null, new Error(error));
        } else {
          callback(params.entries);
        }
      });

      this._worker.postMessage({
        cmd: 'retrieve',
        id: id,
        params: {
          key: key
        }
      });
    },

    removeEntry: function(key, value, callback) {
      var id = this._registerCallback(function(params) {
        if (params.error) {
          callback(new Error(params.error));
        } else {
          callback();
        }
      });

      this._worker.postMessage({
        cmd: 'remove',
        id: id,
        params: {
          key: key,
          value: value
        }
      });
    },

    _sendRequest: function(method, params, callbacks) {
      var self = this;

      this.getState(function(state) {
        if (state !== 'connected') {
          if (callbacks) {
            callbacks.error(new Error("Connect to network at first."));
          }
          return;
        }

        var request = Request.create(method, params);

        if (callbacks) {
          var timer = setTimeout(function() {
            delete self._requestCallbacks[request.requestId];
            callbacks.error(new Error("Request timed out."));
          }, self._config.requestMessageTimeout);

          self._requestCallbacks[request.requestId] = _.once(function(response) {
            clearTimeout(timer);

            if (response.status !== 'SUCCESS') {
              callbacks.error(new Error(response.message));
              return;
            }

            callbacks.success(response.result);
          });
        }

        Utils.debug("Sending request:", request.method);

        var id = self._registerCallback(function(params) {
          if (params.error) {
            clearTimeout(timer);
            delete self._requestCallbacks[request.requestId];
            callbacks.error(new Error(params.error));
          }
        });

        self._worker.postMessage({
          cmd: 'send',
          id: id,
          params: {
            toPeerId: null,
            message: request.toJson()
          }
        });
      });
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

        if (_.has(this._requestCallbacks, response.requestId)) {
          var callback = this._requestCallbacks[response.requestId];
          delete this._requestCallbacks[response.requestId];
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
          self.getState(function(state) {
            if (state !== 'connected') {
              return;
            }

            Utils.debug("Sending response to", fromPeerId, ":", response.method, "(", response.status, ")");

            var id = self._registerCallback(function(params) {
              if (params.error) {
                console.log("Failed to send response to ", fromPeerId, ":", params.error);
              }
            });

            self._worker.postMessage({
              cmd: 'send',
              id: id,
              params: {
                toPeerId: fromPeerId,
                message: response.toJson()
              }
            });
          });
        });
      }
    },

    _createCallbackId: function() {
      return CryptoJS.SHA256(Math.random().toString()).toString();
    },

    _registerCallback: function(callback) {
      var id = this._createCallbackId();
      this_callbacks[id] = callback;
      return id;
    },

    getPeerId: function(callback) {
      var id = this._registerCallback(function(params) {
        if (params.error) {
          callback("");
        } else {
          callback(params.peerId);
        }
      });

      this._worker.postMessage({
        cmd: 'getPeerId',
        id: id
      });
    },

    getDirectConnectedPeers: function(callback) {
      var id = this._registerCallback(function(params) {
        if (params.error) {
          return callback([]);
        }

        callback(_.chain(params.statuses.successors)
                 .concat([statuses.predecessor])
                 .reject(function(peer) { return !peer; })
                 .map(function(peer) { return peer.peerId; })
                 .unique()
                 .value());
      });

      this._worker.postMessage({
        cmd: 'getStatuses',
        id: id
      });
    },

    getState: function(callback) {
      var self = this;

      this.getDirectConnectedPeers(function(peers) {
        if (self._state === 'connected' && _.isEmpty(peers)) {
          callback('listening');
        } else {
          callback(self._state);
        }
      });
    }
  };

  return BbsNetwork;
});
