define(['jquery', 'underscore'], function($, _) {
  var SettingsView = function() {
    this._template = _.template($("#template-settings-index").html());
  };

  SettingsView.prototype = {
    html: function(state, peerId, directConnectedPeers, peers, threadsInfo) {
      var $html = $(this._template({
        state: state,
        peerId: peerId,
        directConnectedPeers: directConnectedPeers,
        peers: peers,
        threadsInfo: threadsInfo
      }));

      $html.find("button.btn-leave-thread").click(function(e) {
        var threadId = e.target.id;
        WebRtcBbs.context.routing.to('/thread/leave', {threadId: threadId});
      });

      return $html;
    }
  };

  return SettingsView;
});
