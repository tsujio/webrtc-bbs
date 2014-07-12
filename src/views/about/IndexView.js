(function() {
  var $ = require('jquery');
  var _ = require('underscore');

  var IndexView = function() {
    this._template = _.template($("#template-about-index").html());
  };

  IndexView.prototype = {
    html: function(requiredFunctions) {
      return this._template({requiredFunctions: requiredFunctions});
    },

    onrendered: function() {
    }
  };

  module.exports = IndexView;
})();
