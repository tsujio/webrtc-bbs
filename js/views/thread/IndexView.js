define(['jquery', 'underscore', 'utils/Utils'], function($, _, Utils) {
  var IndexView = function() {
    this._template = _.template($("#template-thread-index").html());
    this._$html = null;
  };

  IndexView.prototype = {
    html: function(threads, alerts, validator) {
      var self = this;

      if (!threads) {
        threads = [];
      }

      threads = _.sortBy(threads, 'updatedAt');
      threads.reverse();

      this._$html = $(this._template({threads: threads, alerts: alerts}));

      this._$html.find("#form-create-thread").submit(function() {
        try {
          self._createThread(validator);
        } catch (e) {
          console.log("Failed to create thread:", e);
        }
        return false;
      });

      this._$html.find("#btn-create-thread").click(function() {
        self._createThread(validator);
      });

      this._$html.find("#thread-list a").click(function(e) {
        WebRtcBbs.context.routing.to('/thread/show', {threadId: e.target.id});
        return false;
      });

      return this._$html;
    },

    _createThread: function(validator) {
      var newThreadName = this._$html.find("#text-new-thread-name").val();
      var params = {
        name: newThreadName,
        updatedAt: new Date()
      };

      var msg = validator(params);
      if (msg) {
        this._$html.find("#text-new-thread-name").parent("div.form-group").addClass("has-error");
        this._$html.find("#text-new-thread-name").siblings("span.help-block").text(msg);
        return;
      }

      WebRtcBbs.context.routing.to('/thread/create', params);
    }
  };

  return IndexView;
});
