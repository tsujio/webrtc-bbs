define(['underscore', 'db/DbManager'], function(_, DbManager) {
  var BaseModel = function() {
  };

  BaseModel.all = function(model, store, callback) {
    if (!callback) {
      callback = function() {};
    }

    DbManager.getInstance().all(store, function(records, error) {
      if (error) {
        callback(null, error);
      } else {
        callback(_.map(records, function(record) { return model.new(record); }));
      }
    });
  };

  BaseModel.get = function(model, store, id, callback) {
    if (!callback) {
      callback = function() {};
    }

    DbManager.getInstance().get(store, id, function(record, error) {
      if (error) {
        callback(null, error);
      } else {
        callback(model.new(record));
      }
    });
  };

  BaseModel.new = function(model, params) {
    if (!_.isObject(params)) {
      throw new Error("Invalid params.");
    }
    return new model(params);
  };

  BaseModel.create = function(model, params, callback) {
    try {
      model.new(params).save(callback);
    } catch (e) {
      if (callback) {
        callback(null, e);
      }
    }
  };

  BaseModel.createAll = function(model, store, paramsList, callback) {
    if (!callback) {
      callback = function() {};
    }

    DbManager.getInstance().saveAll(store, _.map(paramsList, function(params) {
      return model.new(params).toRecord();
    }), function(records) {
      callback(_.map(records, function(record) { return model.new(record); }));
    });
  };

  BaseModel.update = function(model, store, paramsList, callback) {
    if (!callback) {
      callback = function() {};
    }

    DbManager.getInstance().update(store, paramsList, function(records) {
      callback(_.map(records, function(record) { return model.new(record); }));
    });
  };

  BaseModel.delete = function(store, id, callback) {
    DbManager.getInstance().delete(store, id, callback);
  };

  BaseModel.deleteAll = function(store, callback) {
    DbManager.getInstance().deleteAll(store, callback);
  };

  BaseModel.exists = function(model, store, id, callback) {
    if (!callback) {
      callback = function() {};
    }

    BaseModel.get(model, store, id, function(instance, error) {
      callback(!error);
    });
  };

  BaseModel.where = function(model, store, cond, callback) {
    if (!callback) {
      callback = function() {};
    }

    DbManager.getInstance().where(store, cond, function(records, error) {
      if (error) {
        callback(null, error);
      } else {
        callback(_.map(records, function(record) { return model.new(record); }));
      }
    });
  };

  BaseModel.find = function(model, store, query, callback) {
    if (!callback) {
      callback = function() {};
    }

    DbManager.getInstance().find(store, query, function(records, error) {
      if (error) {
        calback(null, error);
      } else {
        callback(_.map(records, function(record) { return model.new(record); }))
      }
    });
  };

  BaseModel.prototype = {
    save: function(store, callback) {
      if (!callback) {
        callback = function() {};
      }

      var self = this;
      DbManager.getInstance().save(store, this.toRecord(), function(record, error) {
        if (error) {
          callback(null, error);
        } else {
         callback(self);
        }
      });
    },

    destroy: function(store, callback) {
      DbManager.getInstance().delete(store, this.id, callback);
    },

    exists: function(store, callback) {
      BaseModel.exists(this.constructor, store, this.id, callback);
    },

    toJson: function() {
      throw new Error("Not implemented.");
    },

    toRecord: function() {
      throw new Error("Not implemented.");
    }
  };

  return BaseModel;
});
