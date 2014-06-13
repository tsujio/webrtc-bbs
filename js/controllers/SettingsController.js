define([
  'controllers/ApplicationController',
  'views/ApplicationView',
  'views/settings/IndexView',
  'models/Thread',
  'utils/Utils'
], function(ApplicationController, ApplicationView, IndexView, Thread, Utils) {
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

      self._response(format, {
        html: function() {
          (new ApplicationView()).render(new IndexView(),
                                         state,
                                         peerId,
                                         directConnectedPeers,
                                         peers,
                                         threadsInfo);
        }
      });
    });
  };

/*    onCreateButtonClicked: function(callback) {
      this._networkAgent.createNetwork(callback);
    },

    onJoinButtonClicked: function(bootstrapId, callback) {
      this._networkAgent.joinNetwork(bootstrapId, function(peerId) {
        callback(peerId);
      });
    }
  };*/

  return SettingsController;
});
