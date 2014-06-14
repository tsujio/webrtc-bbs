define([
  'underscore',
  'controllers/ApplicationController',
  'views/ApplicationView',
  'views/contact/IndexView',
  'utils/Utils'
], function(_, ApplicationController, ApplicationView, IndexView, Utils) {
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

  return ContactController;
});
