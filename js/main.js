define([
  'jquery',
  'underscore',
  'routing/Routing',
  'net/NetworkAgent',
  'models/Setting',
  'db/DbManager',
  'tasks/UpdateBbsContentsTask',
  'tasks/MaintenanceNetworkTask',
  'utils/Utils'
], function($, _, Routing, NetworkAgent, Setting, DbManager, UpdateBbsContentsTask, MaintenanceNetworkTask, Utils) {
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

        Setting.exists(Setting.defaultId, function(exists) {
          if (!exists) {
            Utils.debug("Setting does not exist, create it.");

            Setting.create(Setting.getDefaults(), function(setting, error) {
              if (error) {
                console.log("Failed to create setting:", error);
              }
            });
          }
        });

        var networkAgent = new NetworkAgent(config);
        networkAgent.joinNetwork(function(peerId, error) {
          if (error) {
            console.log("Failed to join network: " + error);
            return;
          }
          Utils.debug("Peer ID: " + peerId);

          WebRtcBbs.context.tasks.updateBbsContentsTask.run();
        });

        WebRtcBbs.context.routing = new Routing(networkAgent);

        WebRtcBbs.context.tasks = {
          updateBbsContentsTask: UpdateBbsContentsTask.create(networkAgent, config),
          maintenanceNetworkTask: MaintenanceNetworkTask.create(networkAgent, config),
        };

        $(window).on("popstate", function(e) {
          var state = e.originalEvent.state;
          WebRtcBbs.context.routing.to(state.path, state.args, true);
        });

        if (window.history) {
          history.replaceState({
            path: '/',
            args: {}
          }, null);
        }

        WebRtcBbs.context.routing.to('/');
      });
    });
  };

  return main;
});
