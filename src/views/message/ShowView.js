(function() {
  var $ = require('jquery');
  var _ = require('underscore');
  var Utils = require('../../utils/Utils');

  var ShowView = function() {
    this._template = _.template($("#template-message-show").html());
  };

  ShowView.prototype = {
    html: function(message) {
      if (!message) {
        return null;
      }

      message = message.createProcessedMessage();

      return this._template({message: message});
    },

    onrendered: function(message) {
      $("#a-message-show").click(function() {
        WebRtcBbs.context.routing.to('/message/show', {messageId: message.id});
        return false;
      });

      $("#a-reply").click(function() {
        WebRtcBbs.context.routing.to('/thread/show', {
          threadId: message.threadId,
          fillInMessage: ">>" + message.id.substr(0, 8) + "\n"
        });
        return false;
      });

      $("#btn-delete-message").click(function() {
        WebRtcBbs.context.routing.to('/message/delete', {
          messageId: message.id,
          threadId: message.threadId
        });
      });

      $("#dd-message-body a").click(function() {
        return false;
      });
    }
  };

  module.exports = ShowView;
})();
