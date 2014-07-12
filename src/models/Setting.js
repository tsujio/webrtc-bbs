(function() {
  var _ = require('underscore');
  var BaseModel = require('./BaseModel');
  var Utils = require('../utils/Utils');

  var Setting = Utils.inherit(BaseModel, function(params) {
    BaseModel.call(this, params);

    if (!Utils.isPositiveNumber(params.maxNumberOfMessagesPerThread)) {
      throw new Error("Maximum number of messages per thread must be a positive number.");
    }

    this.maxNumberOfMessagesPerThread = params.maxNumberOfMessagesPerThread;

    this.id = this._createId();
  });

  var MODEL_CLASS = Setting;
  var STORE_NAME = 'setting';

  Setting.defaultId = "setting";

  Setting.getDefaults = function() {
    return {
      maxNumberOfMessagesPerThread: 1000,
    };
  };

  MODEL_CLASS.all = function(callback) {
    BaseModel.all(MODEL_CLASS, STORE_NAME, callback);
  };

  MODEL_CLASS.get = function(id, callback) {
    BaseModel.get(MODEL_CLASS, STORE_NAME, id, callback);
  };

  MODEL_CLASS.new = function(params) {
    return BaseModel.new(MODEL_CLASS, params);
  };

  MODEL_CLASS.create = function(params, callback) {
    BaseModel.create(MODEL_CLASS, params, callback);
  };

  MODEL_CLASS.createAll = function(paramsList, callback) {
    BaseModel.createAll(MODEL_CLASS, STORE_NAME, paramsList, callback);
  };

  MODEL_CLASS.delete = function(id, callback) {
    BaseModel.delete(STORE_NAME, id, callback);
  };

  MODEL_CLASS.deleteAll = function(callback) {
    BaseModel.deleteAll(STORE_NAME, callback);
  };

  MODEL_CLASS.exists = function(id, callback) {
    BaseModel.exists(MODEL_CLASS, STORE_NAME, id, callback);
  };

  MODEL_CLASS.where = function(cond, callback) {
    BaseModel.where(MODEL_CLASS, STORE_NAME, cond, callback);
  };

  MODEL_CLASS.find = function(query, callback) {
    BaseModel.find(MODEL_CLASS, STORE_NAME, query, callback);
  };

  MODEL_CLASS.prototype._createId = function() {
    return Setting.defaultId;
  };

  MODEL_CLASS.prototype.save = function(callback) {
    BaseModel.prototype.save.call(this, STORE_NAME, callback);
  };

  MODEL_CLASS.prototype.exists = function(callback) {
    MODEL_CLASS.exists(this.id, callback);
  };

  MODEL_CLASS.prototype.destroy = function(callback) {
    BaseModel.prototype.destroy.call(this, STORE_NAME, callback);
  };

  MODEL_CLASS.prototype.toJson = function() {
    var record = this.toRecord();
    return record;
  };

  MODEL_CLASS.prototype.toRecord = function() {
    return {
      id: this.id,
      maxNumberOfMessagesPerThread: this.maxNumberOfMessagesPerThread,
    };
  };

  module.exports = MODEL_CLASS;
})();
