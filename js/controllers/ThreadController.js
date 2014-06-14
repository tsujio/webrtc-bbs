define([
  'underscore',
  'controllers/ApplicationController',
  'views/ApplicationView',
  'views/thread/IndexView',
  'views/thread/ShowView',
  'models/Thread',
  'models/Message',
  'utils/Utils'
], function(_, ApplicationController, ApplicationView, IndexView, ShowView, Thread, Message, Utils) {
  var ThreadController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  ThreadController.prototype.index = function(args, format, callback) {
    var self = this;

    var requiredFunctions = Utils.listRequiredFunctions();
    var alerts = _.chain(requiredFunctions)
      .map(function(support, funcName) {
        return support ? "" : funcName + " is not supported on your browser.";
      })
      .compact()
      .value();

    Thread.all(function(threads, error) {
      if (error) {
        console.log("Failed to get threads:", error);
        threads = [];
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

    if (!args.threadId) {
      throw new Error("Thread ID is required.");
    }

    if (format === 'html') {
      this._networkAgent.joinThreadNetwork(args.threadId, function(error) {
        if (error) {
          console.log("Failed to join thread network (thread ID: " + args.threadId + "): " + error);
          return;
        }
      });
    }

    Thread.get(args.threadId, function(thread, error) {
      if (error) {
        throw new Error("Failed to get thread:", error);
      }

      thread.getMessages(function(messages) {
        self._response(format, {
          html: function() {
            (new ApplicationView()).render(new ShowView(), thread, messages, function(params) {
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

  return ThreadController;
});
