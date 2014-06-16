define(['jquery', 'underscore', 'utils/Utils'], function($, _, Utils) {
  var ShowView = function() {
    this._template = _.template($("#template-message-show").html());
    this._$html = null;
  };

  ShowView.prototype = {
    html: function(message) {
      var self = this;

      if (!message) {
        return null;
      }

      message = message.createProcessedMessage();

      this._$html = $(this._template({message: message}));

      this._$html.find("#a-message-show").click(function() {
        WebRtcBbs.context.routing.to('/message/show', {messageId: message.id});
        return false;
      });

      this._$html.find("#btn-delete-message").click(function() {
        WebRtcBbs.context.routing.to('/message/delete', {
          messageId: message.id,
          threadId: message.threadId
        });
      });

      return this._$html;
    }
  };

  return ShowView;
});
