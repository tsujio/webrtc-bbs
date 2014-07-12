(function() {
  var ApplicationController = function(networkAgent) {
    this._networkAgent = networkAgent;
  };

  ApplicationController.prototype = {
    _response: function(format, callbacks) {
      if (!callbacks) {
        return;
      }

      switch (format) {
        case 'html':
        if (callbacks.html) {
          callbacks.html();
        }
        break;

      case 'json':
        if (callbacks.json) {
          callbacks.json();
        }
        break;
      }
    }
  };

  module.exports = ApplicationController;
})();
