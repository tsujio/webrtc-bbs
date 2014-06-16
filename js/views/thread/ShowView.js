define(['jquery', 'underscore', 'utils/Utils'], function($, _, Utils) {
  var ShowView = function() {
    this._template = _.template($("#template-thread-show").html());
  };

  ShowView.prototype = {
    html: function(thread, messages) {
      if (!thread) {
        return null;
      }
      if (!messages) {
        messages = [];
      }

      messages = _.sortBy(messages, 'date');

      messages = _.map(messages, function(message) { return message.createProcessedMessage(); });

      return this._template({thread: thread, messages: messages});
    },

    onrendered: function(thread, messages, fillInMessage, validator) {
      var self = this;

      $("#form-post-message").submit(function() {
        try {
          self._postMessage(thread, validator);
        } catch (e) {
          console.log("Failed to post message:", e);
        }
        return false;
      });

      $("#message-list a.a-message-show").click(function() {
        var messageId = $(this).parent().attr("id");
        WebRtcBbs.context.routing.to('/message/show', {messageId: messageId});
        return false;
      });

      $("#message-list a.a-reply").click(function() {
        var messageId = $(this).parent().attr("id");
        WebRtcBbs.context.routing.to('/thread/show', {
          threadId: thread.id,
          fillInMessage: ">>" + messageId.substr(0, 8) + "\n"
        });
        return false;
      });

      $("#btn-post-message").click(function() {
        self._postMessage(thread, validator);
      });

      if (fillInMessage) {
        $("#textarea-message-body").focus().val(fillInMessage);
        $(window).scrollTop($("#panel-post-message").offset().top);
      }
    },

    _postMessage: function(thread, validator) {
      var body = $("#textarea-message-body").val();
      var params = {
        threadId: thread.id,
        date: new Date(),
        body: body
      };

      var msg = validator(params);
      if (msg) {
        $("#textarea-message-body").parent("div.form-group").addClass("has-error");
        $("#textarea-message-body").siblings("span.help-block").text(msg);
        return;
      }

      WebRtcBbs.context.routing.to('/message/create', params);
    }
  };

  return ShowView;
});
