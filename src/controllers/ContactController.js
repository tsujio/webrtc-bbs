(function() {
  var _ = require('underscore');
  var ApplicationController = require('./ApplicationController');
  var ApplicationView = require('../views/ApplicationView');
  var IndexView = require('../views/contact/IndexView');
  var Utils = require('../utils/Utils');

  var ContactController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  ContactController.prototype.index = function(args, format) {
    this._response(format, {
      html: function() {
        (new ApplicationView()).render(new IndexView());
      }
    });
  };

  module.exports = ContactController;
})();
