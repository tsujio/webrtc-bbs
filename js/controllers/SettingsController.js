define([
  'underscore',
  'controllers/ApplicationController',
  'views/ApplicationView',
  'views/settings/IndexView',
  'models/Thread',
  'utils/Utils'
], function(_, ApplicationController, ApplicationView, IndexView, Thread, Utils) {
  var SettingsController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  SettingsController.prototype.index = function(args, format) {
    var self = this;

    self._networkAgent.getState(null, function(state) {
      self._networkAgent.getPeerId(null, function(peerId) {
        self._networkAgent.getDirectConnectedPeers(null, function(directConnectedPeers) {
          var peers = self._networkAgent.getPeers();
          Thread.all(function(threads) {
            threads = _.filter(threads, function(thread) {
              return _.contains(self._networkAgent.getJoiningThreadIds(), thread.id);
            });

            var getThreadsInfo = function(threads, callback) {
              if (_.isEmpty(threads)) {
                return callback([]);
              }

              self._networkAgent.getDirectConnectedPeers(_.first(threads).id, function(directConnectedPeers) {
                getThreadsInfo(_.rest(threads), function(threadsInfo) {
                  callback([{
                    thread: _.first(threads),
                    directConnectedPeers: directConnectedPeers
                  }].concat(threadsInfo));
                });
              });
            };
            getThreadsInfo(threads, function(threadsInfo) {
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
          });
        });
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
