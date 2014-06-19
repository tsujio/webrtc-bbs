define(['underscore', 'db/MemoryDb', 'utils/Utils'], function(_, MemoryDb, Utils) {
  var DbManager = function(db) {
    this._db = db;
  };

  DbManager.initialize = function(callback) {
    var DB_NAME = 'WebRtcBbs';
    var DB_VERSION = 2;

    if (!callback) {
      callback = function() {};
    }

    if (!window.indexedDB) {
      DbManager._instance = new MemoryDb();
      callback(new Error("indexedDB is not supported."));
      return;
    }

    var request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = function(e) {
      Utils.debug("Upgrade DB.");

      e.target.transaction.onerror = function (e) {
        Utils.debug("Transaction failed:", e.value);

        callback(e.value);
      };

      var db = e.target.result;

      if (db.objectStoreNames.contains('thread')) {
        db.deleteObjectStore('thread');
      }
      var threadStore = db.createObjectStore('thread', {
        keyPath: 'id'
      });

      if (db.objectStoreNames.contains('message')) {
        db.deleteObjectStore('message');
      }
      var messageStore = db.createObjectStore('message', {
        keyPath: 'id'
      });
      messageStore.createIndex('threadIdIndex', 'threadId', {unique: false});
      messageStore.createIndex('dateIndex', 'date', {unique: false});
    };

    request.onsuccess = function(e) {
      Utils.debug("Opening DB succeeded.");

      DbManager._instance = new DbManager(e.target.result);
      callback();
    };

    request.onerror = function(e) {
      Utils.debug("Failed to open DB:", e.value);

      DbManager._instance = new MemoryDb();

      callback(e.value);
    };
  };

  DbManager.getInstance = function() {
    return DbManager._instance;
  };

  DbManager._instance = null;

  DbManager.prototype = {
    all: function(store, callback) {
      if (!callback) {
        callback = function() {};
      }

      var records = [];
      var request = this._db.transaction(store, 'readonly')
        .objectStore(store).openCursor();
      request.onsuccess = function(e) {
        var result = e.target.result;
        if (!result) {
          callback(records);
          return;
        }
        records.push(result.value);
        result.continue();
      };
      request.onerror = function(e) {
        callback(null, e.value);
      };
    },

    get: function(store, id, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = this._db.transaction(store, 'readonly')
        .objectStore(store).get(id);
      request.onsuccess = function(e) {
        var result = e.target.result;
        if (!result) {
          callback(null, new Error("ID:", id, "is not found in", store, "store."));
          return;
        }

        callback(result);
      };
      request.onerror = function(e) {
        callback(null, e.value);
      };
    },

    delete: function(store, id, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = this._db.transaction(store, 'readwrite')
        .objectStore(store).delete(id);
      request.onsuccess = function(e) {
        callback();
      };
      request.onerror = function(e) {
        callback(e.value);
      };
    },

    deleteAll: function(store, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = this._db.transaction(store, 'readwrite')
        .objectStore(store).clear();
      request.onsuccess = function(e) {
        callback();
      };
      request.onerror = function(e) {
        callback(e.value);
      };
    },

    save: function(store, record, callback) {
      if (!callback) {
        callback = function() {};
      }

      var request = this._db.transaction(store, 'readwrite')
        .objectStore(store).put(record);
      request.onsuccess = function(e) {
        var result = e.target.result;
        if (!result) {
          callback(null, new Error("Failed to save record:", record));
          return;
        }

        callback(record);
      };
      request.onerror = function(e) {
        callback(null, e.value);
      };
    },

    saveAll: function(store, records, callback) {
      if (!callback) {
        callback = function() {};
      }

      var self = this;
      if (records.length === 0) {
        callback([]);
        return;
      }
      this.save(store, records[0], function(record, error) {
        self.saveAll(store, records.slice(1), function(records) {
          if (error) {
            console.log(error);
            callback(records);
          } else {
            callback([record].concat(records));
          }
        });
      });
    },

    update: function(store, records, callback) {
      if (!callback) {
        callback = function() {};
      }

      var self = this;
      if (records.length === 0) {
        callback([]);
        return;
      }

      this.get(store, records[0].id, function(record, error) {
        if (error) {
          console.log(error);
          self.update(store, records.slice(1), callback);
          return;
        }
        self.save(store, _.extend(record, records[0]), function(record, error) {
          self.update(store, records.slice(1), function(records) {
            if (error) {
              console.log(error);
              callback(records);
            } else {
              callback([record].concat(records));
            }
          });
        });
      });
    },

    where: function(store, cond, callback) {
      if (!callback) {
        callback = function() {};
      }

      this.all(store, function(records, error) {
        if (error) {
          callback(null, error);
          return;
        }

        callback(_.filter(records, cond));
      });
    },

    find: function(store, query, callback) {
      if (!callback) {
        callback = function() {};
      }

      var records = [];
      var request = this._db.transaction(store, 'readonly')
        .objectStore(store).index(this._getIndexName(query))
        .openCursor(this._getKeyRange(query));
      request.onsuccess = function(e) {
        var result = e.target.result;
        if (!result) {
          callback(records);
          return;
        }

        records.push(result.value);
        result.continue();
      };
      request.onerror = function(e) {
        callback(null, e.value);
      };
    },

    _getIndexName: function(query) {
      return _.keys(query)[0] + 'Index';
    },

    _getKeyRange: function(query) {
      var value = _.values(query)[0];
      if (_.isString(value)) {
        return IDBKeyRange.only(value);
      }
      if (_.has(value, 'upperBound') && _.has(value, 'lowerBound')) {
        return IDBKeyRange.bound(value.lowerBound, value.upperBound, true, true);
      }
      if (_.has(value, 'upperBound') && !_.has(value, 'lowerBound')) {
        return IDBKeyRange.upperBound(value.upperBound, true);
      }
      if (!_.has(value, 'upperBound') && _.has(value, 'lowerBound')) {
        return IDBKeyRange.lowerBound(value.lowerBound, true);
      }
    }
  };

  return DbManager;
});
