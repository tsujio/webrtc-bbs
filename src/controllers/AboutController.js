(function() {
  var _ = require('underscore');
  var ApplicationController = require('./ApplicationController');
  var ApplicationViwe = require('../views/ApplicationView');
  var IndexView = require('../views/about/IndexView');
  var Utils = require('../utils/Utils');

  var AboutController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  AboutController.prototype.index = function(args, format) {
    var requiredFunctions = Utils.listRequiredFunctions();

    this._response(format, {
      html: function() {
        (new ApplicationView()).render(new IndexView(), requiredFunctions);
      }
    });
  };

  module.exports = AboutController;
})();
