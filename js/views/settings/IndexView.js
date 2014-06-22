define(['jquery', 'underscore', 'utils/Utils'], function($, _, Utils) {
  var IndexView = function() {
    this._template = _.template($("#template-settings-index").html());
  };

  IndexView.prototype = {
    html: function(state, peerId, directConnectedPeers, peers, threadsInfo, setting) {
      if (state === 'connecting') {
        state = 'Trying to connect';
      }

      return this._template({
        state: state,
        peerId: peerId,
        directConnectedPeers: directConnectedPeers,
        peers: peers,
        threadsInfo: threadsInfo,
        setting: setting,
      });
    },

    onrendered: function() {
      $("button.btn-leave-thread").click(function(e) {
        var threadId = e.target.id;
        WebRtcBbs.context.routing.to('/thread/leave', {threadId: threadId});
      });

      $("#btn-apply-settings").click(function() {
        var maxNumberOfMessagesPerThread = $("#number-max-messages-per-thread").val();

        maxNumberOfMessagesPerThread = parseInt(maxNumberOfMessagesPerThread);

        if (!Utils.isPositiveNumber(maxNumberOfMessagesPerThread)) {
          $("#number-max-messages-per-thread").parent().parent().addClass("danger");
          return;
        }

        WebRtcBbs.context.routing.to('/settings/update', {
          setting: {
            maxNumberOfMessagesPerThread: maxNumberOfMessagesPerThread,
          }
        });
      });
    }
  };

  return IndexView;
});
