(function() {
  var _ = require('underscore');
  var BaseTask = require('./BaseTask');
  var Utils = require('../utils/Utils');

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

    var maintenanceThreadNetworks = function() {
      var threadIds = self._networkAgent.getJoiningThreadIds();
      _.each(threadIds, function(threadId) {
        if (self._networkAgent.getState(threadId) !== 'connected' &&
            self._networkAgent.getState(threadId) !== 'connecting') {
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

    if (this._networkAgent.getState() !== 'connected' &&
        this._networkAgent.getState() !== 'connecting') {
      this._networkAgent.leaveNetwork();

      this._networkAgent.joinNetwork(function(peerId, error) {
        if (error) {
          console.log("Failed to join network: " + error);
          return;
        }
        console.log("Peer ID: " + peerId);

        maintenanceThreadNetworks();
      });
    } else {
      maintenanceThreadNetworks();
    }
  };

  module.exports = MaintenanceNetworkTask;
})();
