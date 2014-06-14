define(['jquery', 'underscore'], function($, _) {
  var IndexView = function() {
    this._template = _.template($("#template-settings-index").html());
    this._$html = null;
  };

  IndexView.prototype = {
    html: function(state, peerId, directConnectedPeers, peers, threadsInfo) {
      if (state === 'connecting') {
        state = 'Trying to connect';
      }

      this._$html = $(this._template({
        state: state,
        peerId: peerId,
        directConnectedPeers: directConnectedPeers,
        peers: peers,
        threadsInfo: threadsInfo
      }));

      this._$html.find("button.btn-leave-thread").click(function(e) {
        var threadId = e.target.id;
        WebRtcBbs.context.routing.to('/thread/leave', {threadId: threadId});
      });

      return this._$html;
    }
  };

  return IndexView;
});
