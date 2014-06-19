define(['underscore', 'utils/Utils'], function(_, Utils) {
  var MemoryDb = function() {
    this._db = {};
  };

  MemoryDb.prototype = {
    all: function(store, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback([]);
    },

    get: function(store, id, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback(null, new Error("Not implemented."));
    },

    delete: function(store, id, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback();
    },

    deleteAll: function(store, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback();
    },

    save: function(store, record, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback(null, new Error("Not implemented."));
    },

    saveAll: function(store, records, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback([]);
    },

    update: function(store, records, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback([]);
    },

    where: function(store, cond, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback([]);
    },

    find: function(store, query, callback) {
      if (!callback) {
        callback = function() {};
      }

      callback([]);
    },
  };

  return MemoryDb;
});
