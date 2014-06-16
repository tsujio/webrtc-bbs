define(['jquery', 'underscore', 'utils/Utils'], function($, _, Utils) {
  var ShowView = function() {
    this._template = _.template($("#template-thread-show").html());
    this._$html = null;
  };

  ShowView.prototype = {
    html: function(thread, messages, validator) {
      var self = this;

      if (!thread) {
        return null;
      }
      if (!messages) {
        messages = [];
      }

      messages = _.sortBy(messages, 'date');

      _.each(messages, function(message) {
        message.body = Utils.replaceCrLf(_.escape(message.body));
      });

      this._$html = $(this._template({thread: thread, messages: messages}));

      this._$html.submit(function() {
        try {
          self._postMessage(thread, validator);
        } catch (e) {
          console.log("Failed to post message:", e);
        }
        return false;
      });

      this._$html.find("#message-list a.a-message-show").click(function() {
        var messageId = $(this).parent().attr("id");
        WebRtcBbs.context.routing.to('/message/show', {messageId: messageId});
        return false;
      });

      this._$html.find("#btn-post-message").click(function() {
        self._postMessage(thread, validator);
      });

      return this._$html;
    },

    _postMessage: function(thread, validator) {
      var body = this._$html.find("#textarea-message-body").val();
      var params = {
        threadId: thread.id,
        date: new Date(),
        body: body
      };

      var msg = validator(params);
      if (msg) {
        this._$html.find("#textarea-message-body").parent("div.form-group").addClass("has-error");
        this._$html.find("#textarea-message-body").siblings("span.help-block").text(msg);
        return;
      }

      WebRtcBbs.context.routing.to('/message/create', params);
    }
  };

  return ShowView;
});
