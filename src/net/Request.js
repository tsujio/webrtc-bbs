(function() {
  var _ = require('underscore');
  var CryptoJS = require('cryptojs');
  var Response = require('./Response');
  var Utils = require('../utils/Utils');

  var Request = function(version, method, params, requestId, timestamp) {
    if (!_.isArray(version) || version[0] !== Utils.version[0]) {
      throw new Error("Incompatible version: " + version);
    }
    if (!Utils.isNonemptyString(method) || !_.isObject(params) ||
        !Utils.isNonemptyString(requestId) || !_.isNumber(timestamp)) {
      throw new Error("Invalid argument.");
    }

    this.version = version;
    this.method = method;
    this.params = params;
    this.requestId = requestId;
    this.timestamp = timestamp;
  };

  Request.create = function(method, params) {
    return new Request(Utils.version, method, params, Request._createId(), _.now());
  };

  Request._createId = function() {
    return CryptoJS.SHA256(Math.random().toString()).toString();
  };

  Request.isRequest = function(data) {
    return !Response.isResponse(data);
  };

  Request.fromJson = function(json) {
    if (!_.isObject(json)) {
      throw new Error("Invalid argument.");
    }
    return new Request(json.version, json.method, json.params, json.requestId, json.timestamp);
  };

  Request.prototype = {
    toJson: function() {
      return {
        version: this.version,
        method: this.method,
        params: this.params,
        requestId: this.requestId,
        timestamp: this.timestamp
      };
    }
  };

  module.exports = Request;
})();
