define([
  'underscore',
  'controllers/ThreadController',
  'controllers/MessageController',
  'controllers/AboutController',
  'controllers/ContactController',
  'controllers/SettingsController'
], function(_, ThreadController, MessageController, AboutController, ContactController, SettingsController) {
  var Routing = function(networkAgent) {
    this._controllers = {
      threadController: new ThreadController(networkAgent),
      messageController: new MessageController(networkAgent),
      aboutController: new AboutController(networkAgent),
      contactController: new ContactController(networkAgent),
      settingsController: new SettingsController(networkAgent)
    };
  };

  Routing.prototype = {
    to: function(path, args, noPushState, callback) {
      var self = this;

      _.defer(function() {
        if (!path) {
          throw new Error("Path is not specified.");
        }
        if (args && !_.isObject(args)) {
          throw new Error("args expected to be a object.");
        }

        if (path === '/') {
          path = '/thread';
        }

        var elements = path.split('/');
        if (elements.length < 2) {
          throw new Error("Invalid path: " + path);
        }
        elements.shift();

        var controller = self._controllers[elements[0] + 'Controller'];
        if (!controller) {
          throw new Error("Unknown controller: " + elements[0]);
        }

        if (!elements[1]) {
          elements[1] = 'index.html';
        }

        var elms = elements[1].split('.');

        var action = controller[elms[0]];
        if (!action) {
          throw new Error("Unknown action: " + elms[0]);
        }

        if (elms.length < 2 || !elms[1]) {
          elms[1] = 'html';
        }

        if (!noPushState && _.contains(['index', 'show'], elms[0]) && elms[1] === 'html') {
          if (window.history) {
            history.pushState({
              path: path,
              args: args
            }, null);
          }
        }

        if (!callback) {
          callback = function() {};
        }

        action.call(controller, args, elms[1], callback);
      });
    },

    reload: function() {
      if (window.history) {
        var state = history.state;
        this.to(state.path, state.args);
      }
    }
  };

  return Routing;
});
