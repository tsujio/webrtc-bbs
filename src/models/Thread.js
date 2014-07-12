(function() {
  var _ = require('underscore');
  var BaseModel = require('./BaseModel');
  var Message = require('./Message');
  var Utils = require('../utils/Utils');

  var Thread = Utils.inherit(BaseModel, function(params) {
    BaseModel.call(this, params);

    if (!Utils.isNonemptyString(params.name)) {
      throw new Error("Thread name must not be empty.");
    }
    if (_.size(params.name) > Thread.MAX_NAME_LENGTH) {
      throw new Error("Thread name is too long. Max length is " + Thread.MAX_NAME_LENGTH + ".");
    }
    if (_.isString(params.updatedAt)) {
      params.updatedAt = new Date(params.updatedAt);
    }
    if (!_.isDate(params.updatedAt)) {
      throw new Error("Invalid Option.");
    }
    if (_.isNaN(params.updatedAt.getTime())) {
      throw new Error("Invalid date.");
    }

    this.name = params.name;
    this.updatedAt = params.updatedAt;

    this.id = this._createId();
  });

  var MODEL_CLASS = Thread;
  var STORE_NAME = 'thread';

  Thread.MAX_NAME_LENGTH = 127;

  Thread.all = function(callback) {
    BaseModel.all(MODEL_CLASS, STORE_NAME, callback);
  };

  Thread.get = function(id, callback) {
    BaseModel.get(MODEL_CLASS, STORE_NAME, id, callback);
  };

  Thread.new = function(params) {
    return BaseModel.new(MODEL_CLASS, params);
  };

  Thread.create = function(params, callback) {
    BaseModel.create(MODEL_CLASS, params, callback);
  };

  Thread.createAll = function(paramsList, callback) {
    BaseModel.createAll(MODEL_CLASS, STORE_NAME, paramsList, callback);
  };

  Thread.update = function(paramsList, callback) {
    try {
      _.each(paramsList, function(params) {
        Thread.new(_.extend({name: "dummy", updatedAt: new Date()}, params));
      });
    } catch (e) {
      if (callback) {
        console.log("Failed to update records:", e);
        callback([]);
      }
      return;
    }

    BaseModel.update(MODEL_CLASS, STORE_NAME, paramsList, callback);
  };

  Thread.delete = function(id, callback) {
    BaseModel.delete(STORE_NAME, id, callback);
  };

  Thread.deleteAll = function(callback) {
    BaseModel.deleteAll(STORE_NAME, callback);
  };

  Thread.exists = function(id, callback) {
    BaseModel.exists(MODEL_CLASS, STORE_NAME, id, callback);
  };

  Thread.where = function(cond, callback) {
    BaseModel.where(MODEL_CLASS, STORE_NAME, cond, callback);
  };

  Thread.find = function(query, callback) {
    BaseModel.find(MODEL_CLASS, STORE_NAME, query, callback);
  };

  Thread.prototype._createId = function() {
    return CryptoJS.SHA256(this.name).toString();
  };

  Thread.prototype.save = function(callback) {
    BaseModel.prototype.save.call(this, STORE_NAME, callback);
  };

  Thread.prototype.destroy = function(callback) {
    BaseModel.prototype.destroy.call(this, STORE_NAME, callback);
  };

  Thread.prototype.exists = function(callback) {
    Thread.exists(this.id, callback);
  };

  Thread.prototype.toJson = function() {
    var record = this.toRecord();
    return _.extend(record, {updatedAt: record.updatedAt.toISOString()});
  };

  Thread.prototype.toRecord = function() {
    return {
      id: this.id,
      name: this.name,
      updatedAt: this.updatedAt
    };
  };

  Thread.prototype.getMessages = function(callback) {
    Message.find({
      threadId: this.id
    }, callback);
  };

  Thread.prototype.createMessage = function(params, callback) {
    Message.create(_.extend(opts, {threadId: this.id}), callback);
  },

  Thread.prototype.createMessages = function(paramsList, callback) {
    var self = this;
    Message.createAll(_.map(paramsList, function(params) {
      return _.extend(params, {threadId: self.id});
    }), callback);
  };

  module.exports = Thread;
})();
