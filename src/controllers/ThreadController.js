(function() {
  var _ = require('underscore');
  var ApplicationController = require('./ApplicationController');
  var ApplicationView = require('../views/ApplicationView');
  var IndexView = require('../views/thread/IndexView');
  var ShowView = require('../views/thread/ShowView');
  var Thread = require('../models/Thread');
  var Message = require('../models/Message');
  var Utils = require('../utils/Utils');

  var ThreadController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  ThreadController.prototype.index = function(args, format, callback) {
    var self = this;

    if (format === 'html') {
      _.defer(function() {
        WebRtcBbs.context.tasks.updateBbsContentsTask.run();
      });
    }

    var requiredFunctions = Utils.listRequiredFunctions();
    var alerts = _.chain(requiredFunctions)
      .map(function(support, funcName) {
        return support ? "" : funcName + " is not supported on your browser.";
      })
      .compact()
      .value();

    try {
      this._networkAgent.checkPeerSetting();
    } catch (e) {
      alerts.push("The settings of this system is incomplete. " +
                  "Please inform the administrator of the system about the following message: " + e.message);
    }

    Thread.all(function(threads, error) {
      if (error) {
        console.log("Failed to get threads:", error);
        threads = [];
      }

      if (args && args.excludeIds) {
        if (!_.isArray(args.excludeIds)) {
          throw new Error("Invalid args.");
        }

        threads = _.reject(threads, function(thread) {
          return _.contains(args.excludeIds, thread.id);
        });
      }

      self._response(format, {
        html: function() {
          (new ApplicationView()).render(new IndexView(), threads, alerts, function(params) {
            try {
              Thread.new(params);
              return "";
            } catch (e) {
              return e.message;
            }
          });
        },

        json: function() {
          callback(_.invoke(threads, 'toJson'));
        }
      });
    });
  };

  ThreadController.prototype.create = function(args, format) {
    var self = this;

    if (!args.name) {
      throw new Error("Thread name is empty.");
    }

    Thread.new(args).exists(function(exists) {
      Thread.create(args, function(thread, error) {
        if (error) {
          console.log("Failed to create thread:", error);
          return;
        }

        Utils.debug("Created or updated thread:", thread.id);

        if (!exists) {
          Utils.debug("Spreading thread:", thread.id);
          self._networkAgent.spreadThread(thread.toJson());
        }

        self._response(format, {
          html: function() {
            WebRtcBbs.context.routing.to('/thread/show', {threadId: thread.id});
          }
        });
      });
    });
  };

  ThreadController.prototype.show = function(args, format, callback) {
    var self = this;

    if (!args || !args.threadId) {
      throw new Error("Thread ID is required.");
    }

    if (format === 'html') {
      this._networkAgent.joinThreadNetwork(args.threadId, function(peerId, error) {
        if (error) {
          console.log("Failed to join thread network (thread ID: " + args.threadId + "): " + error);
          return;
        }

        Utils.debug("Joined thread network (thread ID:", args.threadId, "):", error);

        if (self._networkAgent.getState(args.threadId) === 'connected') {
          _.defer(function() {
            WebRtcBbs.context.tasks.updateBbsContentsTask.run();
          });
        }
      });
    }

    Thread.get(args.threadId, function(thread, error) {
      if (error) {
        throw new Error("Failed to get thread:", error);
      }

      thread.getMessages(function(messages, error) {
        if (error) {
          throw new Error("Failed to get messages:", error);
        }

        if (args.excludeIds) {
          if (!_.isArray(args.excludeIds)) {
            throw new Error("Invalid args.");
          }

          messages = _.reject(messages, function(message) {
            return _.contains(args.excludeIds, message.id);
          });
        }

        self._response(format, {
          html: function() {
            (new ApplicationView()).render(new ShowView(), thread, messages, args.fillInMessage, function(params) {
              try {
                Message.new(params);
                return "";
              } catch (e) {
                return e.message;
              }
            });
          },

          json: function() {
            callback(thread.toJson(), _.invoke(messages, 'toJson'));
          }
        });
      });
    });
  };

  ThreadController.prototype.leave = function(args, format) {
    if (format !== 'html') {
      return;
    }

    try {
      this._networkAgent.leaveThreadNetwork(args.threadId);
    } catch (e) {
      console.log(e);
    }

    this._response(format, {
      html: function() {
        WebRtcBbs.context.routing.reload();
      }
    });
  };

  module.exports = ThreadController;
})();
