define([
  'underscore', 'tasks/BaseTask', 'utils/Utils'
], function(_, BaseTask, Utils) {
  var MaintenanceNetworkTask = Utils.inherit(BaseTask, function(networkAgent) {
    BaseTask.call(this);

    this._networkAgent = networkAgent;
  });

  MaintenanceNetworkTask.create = function(networkAgent, config) {
    if (!Utils.isPositiveNumber(config.maintenanceNetworkTaskInterval)) {
      config.maintenanceNetworkTaskInterval = 30000;
    }

    return BaseTask.create(new MaintenanceNetworkTask(networkAgent), config.maintenanceNetworkTaskInterval);
  };

  MaintenanceNetworkTask.prototype.run = function() {
    var self = this;

    if (this._networkAgent.getState() === 'failed' ||
        this._networkAgent.getState() === 'listening') {
      this._networkAgent.leaveNetwork();

      this._networkAgent.joinNetwork(function(peerId, error) {
        if (error) {
          console.log("Failed to join network: " + error);
          return;
        }
        console.log("Peer ID: " + peerId);
      });
    }

    var threadIds = this._networkAgent.getJoiningThreadIds();
    _.each(threadIds, function(threadId) {
      if (self._networkAgent.getState(threadId) === 'failed' ||
          self._networkAgent.getState(threadId) === 'listening') {
        self._networkAgent.leaveThreadNetwork(threadId);

        self._networkAgent.joinThreadNetwork(threadId, function(peerId, error) {
          if (error) {
            console.log("Failed to join thread network (thread ID: " + threadId + "): " + error);
            return;
          }
          console.log("Peer ID: " + peerId);
        });
      }
    });
  };

  return MaintenanceNetworkTask;
});
