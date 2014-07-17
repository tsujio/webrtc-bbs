(function() {
  var $ = require('jquery');
  var _ = require('underscore');

  var IndexView = function() {
    this._template = _.template($("#template-about-index").html());
  };

  IndexView.prototype = {
    html: function(requiredFunctions, version) {
      return this._template({
        requiredFunctions: requiredFunctions,
        version: version,
      });
    },

    onrendered: function() {
    }
  };

  module.exports = IndexView;
})();
