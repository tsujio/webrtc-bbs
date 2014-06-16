define(['jquery', 'underscore'], function($, _) {
  var IndexView = function() {
    this._template = _.template($("#template-settings-index").html());
  };

  IndexView.prototype = {
    html: function(state, peerId, directConnectedPeers, peers, threadsInfo) {
      if (state === 'connecting') {
        state = 'Trying to connect';
      }

      return this._template({
        state: state,
        peerId: peerId,
        directConnectedPeers: directConnectedPeers,
        peers: peers,
        threadsInfo: threadsInfo
      });
    },

    onrendered: function() {
      $("button.btn-leave-thread").click(function(e) {
        var threadId = e.target.id;
        WebRtcBbs.context.routing.to('/thread/leave', {threadId: threadId});
      });
    }
  };

  return IndexView;
});
