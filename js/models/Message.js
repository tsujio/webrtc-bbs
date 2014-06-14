define([
  'require', 'underscore', 'models/BaseModel', 'utils/Utils'
], function(require, _, BaseModel, Utils) {
  var Message = Utils.inherit(BaseModel, function(params) {
    BaseModel.call(this, params);

    if (!Utils.isNonemptyString(params.threadId) ||
        (!Utils.isNonemptyString(params.date) && !_.isDate(params.date))) {
      throw new Error("Invalid params.");
    }
    if (!Utils.isNonemptyString(params.body)) {
      throw new Error("Message must not be empty.");
    }
    if (_.size(params.body) > Message.MAX_BODY_LENGTH) {
      throw new Error("Message is too long. Max length is " + Message.MAX_BODY_LENGTH + ".");
    }
    params.body = Utils.normalizeLineFeedCode(params.body);
    if (_.chain(params.body).filter(function(c) {
      return c === "\n";
    }).size().value() > Message.MAX_BODY_LINE) {
      console.log(params.id);
      throw new Error("Line length of message is too long. Max line length is " + Message.MAX_BODY_LINE + ".");
    }
    if (_.isString(params.date)) {
      params.date = new Date(params.date);
    }
    if (_.isNaN(params.date.getTime())) {
      throw new Error("Invalid date.");
    }

    this.threadId = params.threadId;
    this.body = params.body;
    this.date = params.date;

    this.id = this._createId();
  });

  var MODEL_CLASS = Message;
  var STORE_NAME = 'message';

  Message.MAX_BODY_LENGTH = 4096;
  Message.MAX_BODY_LINE = 64;

  Message.all = function(callback) {
    BaseModel.all(MODEL_CLASS, STORE_NAME, callback);
  };

  Message.get = function(id, callback) {
    BaseModel.get(MODEL_CLASS, STORE_NAME, id, callback);
  };

  Message.new = function(params) {
    return BaseModel.new(MODEL_CLASS, params);
  };

  Message.create = function(params, callback) {
    BaseModel.create(MODEL_CLASS, params, callback);
  };

  Message.createAll = function(paramsList, callback) {
    BaseModel.createAll(MODEL_CLASS, STORE_NAME, paramsList, function(messages) {
      var updateParams = _.chain(messages)
        .groupBy('threadId')
        .map(function(messages, threadId) {
          return {
            id: threadId,
            updatedAt: _.max(messages, function(message) {
              return message.date;
            }).date
          };
        })
        .value();

      var Thread = require('models/Thread');
      Thread.update(updateParams, function() {
        if (callback) {
          callback(messages);
        }
      });
    });
  };

  Message.delete = function(id, callback) {
    BaseModel.delete(STORE_NAME, id, callback);
  };

  Message.deleteAll = function(callback) {
    BaseModel.deleteAll(STORE_NAME, callback);
  };

  Message.where = function(cond, callback) {
    BaseModel.where(MODEL_CLASS, STORE_NAME, cond, callback);
  };

  Message.find = function(query, callback) {
    BaseModel.find(MODEL_CLASS, STORE_NAME, query, callback);
  };

  Message.prototype._createId = function() {
    return CryptoJS.SHA256(this.threadId + this.date.toString() + this.body).toString();
  };

  Message.prototype.save = function(callback) {
    BaseModel.prototype.save.call(this, STORE_NAME, function(message, error) {
      if (error) {
        callback(null, error);
      } else {
        var Thread = require('models/Thread');
        Thread.update([{
          id: message.threadId,
          updatedAt: message.date
        }], function() {
          callback(message);
        });
      }
    });
  };

  Message.prototype.exists = function(callback) {
    BaseModel.prototype.exists.call(this, STORE_NAME, callback);
  };

  Message.prototype.destroy = function(callback) {
    BaseModel.prototype.destroy.call(this, STORE_NAME, callback);
  };

  Message.prototype.toJson = function() {
    var record = this.toRecord();
    return _.extend(record, {date: record.date.toISOString()});
  };

  Message.prototype.toRecord = function() {
    return {
      id: this.id,
      threadId: this.threadId,
      date: this.date,
      body: this.body
    };
  };

  return Message;
});
