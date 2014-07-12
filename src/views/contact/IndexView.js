(function() {
  var $ = require('jquery');
  var _ = require('underscore');

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

  module.exports = IndexView;
})();
