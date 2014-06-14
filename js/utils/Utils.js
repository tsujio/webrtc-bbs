define(['underscore'], function(_) {
  var Utils = {
    replaceCrLf: function(str) {
      return str.replace(/[\r\n]/g, "<br />");
    },

    isNonemptyString: function(value) {
      return _.isString(value) && !_.isEmpty(value);
    },

    isValidNumber: function(number) {
      return _.isNumber(number) && !_.isNaN(number);
    },

    isPositiveNumber: function(number) {
      return Utils.isValidNumber(number) && number > 0;
    },

    inherit: function(superClass, subClass) {
      subClass.prototype = Object.create(superClass.prototype);
      subClass.prototype.constructor = subClass;
      return subClass;
    },

    listRequiredFunctions: function() {
      return {
        WebRTC: !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection),
        indexedDB: !!window.indexedDB,
        history: !!window.history,
      };
    },

    enableDebugLog: function(enabled) {
      Utils.debug = function() {
        if (enabled) {
          var args = Array.prototype.slice.call(arguments);
          var d = new Date()
          var timeStr = [d.getHours(), d.getMinutes(), d.getSeconds()].join(':') + ':';
          args.unshift(timeStr);
          console.log.apply(console, args);
        }
      };
    },

    debug: function() {
    }
  };

  return Utils;
});
