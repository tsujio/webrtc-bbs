define(['jquery', 'underscore'], function($, _) {
  var IndexView = function() {
    this._template = _.template($("#template-contact-index").html());
  };

  IndexView.prototype = {
    html: function() {
      return this._template();
    },

    onrendered: function() {
    }
  };

  return IndexView;
});
