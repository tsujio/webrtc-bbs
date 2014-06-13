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

      _.each(messages, function(message) {
        message.body = Utils.replaceCrLf(_.escape(message.body));
      });

      var $html = $(this._template({thread: thread, messages: messages}));

      $html.find("#btn-post-message").click(function() {
        var body = $html.find("#textarea-message-body").val();

        if (!body) {
          $html.find("#textarea-message-body").parent("div.form-group").addClass("has-error");
          $html.find("#textarea-message-body").siblings("span.help-block").text("Message must not be empty.");
          return;
        }

        WebRtcBbs.context.routing.to('/message/create', {
          threadId: thread.id,
          date: new Date(),
          body: body
        });
      });

      return $html;
    }
  };

  return ShowView;
});
