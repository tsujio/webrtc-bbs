(function() {
  var _ = require('underscore');
  var ApplicationController = require('./ApplicationController');
  var Thread = require('../models/Thread');
  var Message = require('../models/Message');
  var ApplicationView = require('../views/ApplicationView');
  var ShowView = require('../views/message/ShowView');
  var Utils = require('../utils/Utils');

  var MessageController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  MessageController.prototype.create = function(args, format) {
    var self = this;

    if (!_.contains(this._networkAgent.getJoiningThreadIds(), args.threadId)) {
      throw new Error("Unknown thread ID: " + args.threadId);
    }

    Message.new(args).exists(function(exists) {
      Message.create(args, function(message, error) {
        if (error) {
          throw new Error("Failed to create message:", error);
        }

        Utils.debug("Created or updated message:", message.id);

        if (!exists) {
          Utils.debug("Spreading message:", message.id);
          self._networkAgent.spreadMessage(message.toJson());
        }

        self._response(format, {
          html: function() {
            WebRtcBbs.context.routing.to('/thread/show', {threadId: args.threadId}, true);
          }
        });
      });
    });
  };

  MessageController.prototype.show = function(args, format) {
    var self = this;

    if (!args || !args.messageId) {
      throw new Error("Message ID is required.");
    }

    Message.get(args.messageId, function(message, error) {
      if (error) {
        throw error;
      }

      self._response(format, {
        html: function() {
          (new ApplicationView()).render(new ShowView(), message);
        }
      });
    });
  };

  MessageController.prototype.delete = function(args, format) {
    var self = this;

    if (!args.messageId) {
      throw new Error("Required message ID.");
    }

    Message.delete(args.messageId, function(error) {
      if (error) {
        throw error;
      }

      self._response(format, {
        html: function() {
          if (args.threadId) {
            WebRtcBbs.context.routing.to('/thread/show', {threadId: args.threadId});
          } else {
            WebRtcBbs.context.routing.to('/thread');
          }
        }
      });
    });
  };

  module.exports = MessageController;
})();
