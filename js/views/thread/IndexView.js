define(['jquery', 'underscore', 'utils/Utils'], function($, _, Utils) {
  var IndexView = function() {
    this._template = _.template($("#template-thread-index").html());
  };

  IndexView.prototype = {
    html: function(threads) {
      if (!threads) {
        threads = [];
      }

      threads = _.sortBy(threads, 'updatedAt');
      threads.reverse();

      var $html = $(this._template({threads: threads}));

      $html.find("#btn-create-thread").click(function() {
        var newThreadName = $html.find("#text-new-thread-name").val();

        if (!newThreadName) {
          $html.find("#text-new-thread-name").parent("div.form-group").addClass("has-error");
          $html.find("#text-new-thread-name").siblings("span.help-block").text("Input new thread name.");
          return;
        }

        WebRtcBbs.context.routing.to('/thread/create', {
          name: newThreadName,
          updatedAt: new Date()
        });
      });

      $html.find("#thread-list a").click(function(e) {
        WebRtcBbs.context.routing.to('/thread/show', {threadId: e.target.id});
        return false;
      });

      return $html;
    }
  };

  return IndexView;
});
