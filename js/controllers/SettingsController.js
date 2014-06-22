define([
  'controllers/ApplicationController',
  'views/ApplicationView',
  'views/settings/IndexView',
  'models/Setting',
  'models/Thread',
  'utils/Utils'
], function(ApplicationController, ApplicationView, IndexView, Setting, Thread, Utils) {
  var SettingsController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  SettingsController.prototype.index = function(args, format) {
    var self = this;

    var state = this._networkAgent.getState();
    var peerId = this._networkAgent.getPeerId();
    var directConnectedPeers = this._networkAgent.getDirectConnectedPeers();
    var peers = this._networkAgent.getPeers();
    Thread.all(function(threads) {
      threads = _.filter(threads, function(thread) {
        return _.contains(self._networkAgent.getJoiningThreadIds(), thread.id);
      });

      var threadsInfo = _.map(threads, function(thread) {
        return {
          thread: thread,
          directConnectedPeers: self._networkAgent.getDirectConnectedPeers(thread.id)
        };
      });

      Setting.get(Setting.defaultId, function(setting, error) {
        if (error) {
          console.log("Failed to load settings:", error);
          setting = Setting.getDefaults();
        }

        self._response(format, {
          html: function() {
            (new ApplicationView()).render(new IndexView(),
                                           state,
                                           peerId,
                                           directConnectedPeers,
                                           peers,
                                           threadsInfo,
                                           setting);
          }
        });
      });
    });
  };

  SettingsController.prototype.update = function(args, format) {
    Setting.create(args.setting, function(setting, error) {
      if (error) {
        console.log("Failed to save settings:", error);
      }

      WebRtcBbs.context.routing.to('/settings');
    });
  };

  return SettingsController;
});
