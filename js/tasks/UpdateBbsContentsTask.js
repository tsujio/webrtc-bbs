define([
  'underscore', 'tasks/BaseTask', 'models/Thread', 'models/Message', 'utils/Utils'
], function(_, BaseTask, Thread, Message, Utils) {
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
      this._networkAgent.fetchThreads(function(threadsInfo, error) {
        if (error) {
          console.log(error);
          return;
        }

        Utils.debug("[UpdateBbsContentsTask] retrieved threads:", _.map(threadsInfo, function(t) {
          return t.id;
        }).toString());

        Thread.createAll(threadsInfo);
      });
    }

    var threadIds = this._networkAgent.getJoiningThreadIds();
    _.each(threadIds, function(threadId) {
      if (self._networkAgent.getState(threadId) === 'connected') {
        self._networkAgent.fetchMessages(threadId, function(messagesInfo, error) {
          if (error) {
            console.log(error);
            return;
          }

          Utils.debug("[UpdateBbsContentsTask] retrieved messages:", _.map(messagesInfo, function(m) {
            return m.id;
          }).toString());

          Message.createAll(messagesInfo);
        });
      }
    });
  };

  return UpdateBbsContentsTask;
});
