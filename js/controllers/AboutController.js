define([
  'underscore',
  'controllers/ApplicationController',
  'views/ApplicationView',
  'views/about/IndexView',
  'utils/Utils'
], function(_, ApplicationController, ApplicationView, IndexView, Utils) {
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

  return AboutController;
});
