(function() {
  var _ = require('underscore');
  var BaseTask = require('./BaseTask');
  var Thread = require('../models/Thread');
  var Message = require('../models/Message');
  var Utils = require('../utils/Utils');

  var UpdateBbsContentsTask = Utils.inherit(BaseTask, function(networkAgent) {
    BaseTask.call(this);

    this._networkAgent = networkAgent;
  });

  UpdateBbsContentsTask.create = function(networkAgent, config) {
    if (!Utils.isPositiveNumber(config.updateBbsContentsTaskInterval)) {
      config.updateBbsContentsTaskInterval = 180000;
    }

    return BaseTask.create(new UpdateBbsContentsTask(networkAgent), config.updateBbsContentsTaskInterval);
  };

  UpdateBbsContentsTask.prototype.run = function() {
    var self = this;

    if (this._networkAgent.getState() === 'connected') {
      Thread.all(function(threads, error) {
        if (error) {
          console.log("Failed to get threads:", error);
          return;
        }

        self._networkAgent.fetchThreads(_.map(threads, function(thread) {
          return thread.id;
        }), function(threadsInfo, error) {
          if (error) {
            console.log("Failed to fetch threads:", error);
            return;
          }

          Utils.debug("[UpdateBbsContentsTask] retrieved threads:", threadsInfo);

          Thread.createAll(threadsInfo);
        });
      });
    }

    var threadIds = this._networkAgent.getJoiningThreadIds();
    _.each(threadIds, function(threadId) {
      if (self._networkAgent.getState(threadId) === 'connected') {
        Message.find({threadId: threadId}, function(messages, error) {
          if (error) {
            console.log("Failed to get messages:", error);
            return;
          }

          self._networkAgent.fetchMessages(threadId, _.map(messages, function(message) {
            return message.id;
          }), function(messagesInfo, error) {
            if (error) {
              console.log("Failed to fetch messages:", error);
              return;
            }

            Utils.debug("[UpdateBbsContentsTask] retrieved messages:", messagesInfo);

            Message.createAll(messagesInfo);
          });
        });
      }
    });
  };

  module.exports = UpdateBbsContentsTask;
})();
