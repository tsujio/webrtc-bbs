define([
  'jquery',
  'underscore',
  'routing/Routing',
  'net/NetworkAgent',
  'db/DbManager',
  'tasks/UpdateBbsContentsTask',
  'tasks/MaintenanceNetworkTask',
  'utils/Utils'
], function($, _, Routing, NetworkAgent, DbManager, UpdateBbsContentsTask, MaintenanceNetworkTask, Utils) {
  var main = function(config) {
    if (!_.isObject(config)) {
      throw new Error("Expect config to be an object.");
    }

    Utils.enableDebugLog(config.debug);

    $(function() {
      window.WebRtcBbs = {context: {}};

      DbManager.initialize(function(error) {
        if (error) {
          console.log("Failed to initialize DB:", error);
        }

        var networkAgent = new NetworkAgent(config);
        networkAgent.joinNetwork(function(peerId, error) {
          if (error) {
            console.log("Failed to join network: " + error);
            return;
          }
          Utils.debug("Peer ID: " + peerId);
        });

        WebRtcBbs.context.routing = new Routing(networkAgent);

        UpdateBbsContentsTask.create(networkAgent, config);
        MaintenanceNetworkTask.create(networkAgent, config);

        $(window).on("popstate", function(e) {
          var state = e.originalEvent.state;
          WebRtcBbs.context.routing.to(state.path, state.args, true);
        });

        history.replaceState({
          path: '/',
          args: {}
        }, null);

        WebRtcBbs.context.routing.to('/');
      });
    });
  };

  return main;
});
