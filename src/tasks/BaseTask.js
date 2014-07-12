(function() {
  var _ = require('underscore');
  var Utils = require('../utils/Utils');

  var BaseTask = function() {
    this._timer = null;
  };

  BaseTask.create = function(task, interval) {
    var timer = setInterval(function() {
      task.run();
    }, interval);

    task._timer = timer;

    return task;
  };

  BaseTask.prototype = {
    run: function() {
      throw new Error("Not implemented.");
    },

    shutdown: function() {
      clearInterval(this._timer);
    }
  };

  module.exports = BaseTask;
})();
