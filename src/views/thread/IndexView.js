(function() {
  var $ = require('jquery');
  var _ = require('underscore');
  var Utils = require('../../utils/Utils');

  var IndexView = function() {
    this._template = _.template($("#template-thread-index").html());
  };

  IndexView.prototype = {
    html: function(threads, alerts) {
      if (!threads) {
        threads = [];
      }

      threads = _.sortBy(threads, 'updatedAt');
      threads.reverse();

      return this._template({threads: threads, alerts: alerts});
    },

    onrendered: function(threads, alerts, validator) {
      var self = this;

      $("#form-create-thread").submit(function() {
        try {
          self._createThread(validator);
        } catch (e) {
          console.log("Failed to create thread:", e);
        }
        return false;
      });

      $("#btn-create-thread").click(function() {
        self._createThread(validator);
      });

      $("#thread-list a").click(function(e) {
        var threadId = Utils.parseQueryString($(this).attr('href')).threadId;
        WebRtcBbs.context.routing.to('/thread/show', {threadId: threadId});
        return false;
      });
    },

    _createThread: function(validator) {
      var newThreadName = $("#text-new-thread-name").val();
      var params = {
        name: newThreadName,
        updatedAt: new Date()
      };

      var msg = validator(params);
      if (msg) {
        $("#text-new-thread-name").parent("div.form-group").addClass("has-error");
        $("#text-new-thread-name").siblings("span.help-block").text(msg);
        return;
      }

      WebRtcBbs.context.routing.to('/thread/create', params);
    }
  };

  module.exports = IndexView;
})();
