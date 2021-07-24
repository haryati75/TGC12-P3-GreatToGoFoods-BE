'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('cart_items', {
    'id': { 'type': 'int', 'unsigned': true, 'primaryKey': true, 'autoIncrement': true },
    'quantity' : {
      'type': 'int',
      'notNull': true
    },
    'created_on': {
      'type': 'datetime',
      'notNull': true
    },
    'modified_on': {
      'type': 'datetime'
    }
  });
};

exports.down = function(db) {
  return db.dropTable('cart_items');
};

exports._meta = {
  "version": 1
};
