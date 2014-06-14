define(['jquery', 'underscore', 'utils/Utils'], function($, _, Utils) {
  var IndexView = function() {
    this._template = _.template($("#template-thread-index").html());
    this._$html = null;
  };

  IndexView.prototype = {
    html: function(threads) {
      var self = this;

      if (!threads) {
        threads = [];
      }

      threads = _.sortBy(threads, 'updatedAt');
      threads.reverse();

      this._$html = $(this._template({threads: threads}));

      this._$html.find("#form-create-thread").submit(function() {
        try {
          self._createThread();
        } catch (e) {
          console.log("Failed to create thread:", e);
        }
        return false;
      });

      this._$html.find("#btn-create-thread").click(function() {
        self._createThread();
      });

      this._$html.find("#thread-list a").click(function(e) {
        WebRtcBbs.context.routing.to('/thread/show', {threadId: e.target.id});
        return false;
      });

      return this._$html;
    },

    _createThread: function() {
      var newThreadName = this._$html.find("#text-new-thread-name").val();

      if (!newThreadName) {
        this._$html.find("#text-new-thread-name").parent("div.form-group").addClass("has-error");
        this._$html.find("#text-new-thread-name").siblings("span.help-block").text("Input new thread name.");
        return;
      }

      WebRtcBbs.context.routing.to('/thread/create', {
        name: newThreadName,
        updatedAt: new Date()
      });
    }
  };

  return IndexView;
});
