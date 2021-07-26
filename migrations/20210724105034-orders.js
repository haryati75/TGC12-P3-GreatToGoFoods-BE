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
  return db.createTable('orders', {
    'id': { 'type': 'int', 'unsigned': true, 'primaryKey': true, 'autoIncrement': true },
    'order_date' : {
      'type': 'datetime',
      'notNull': true
    },
    'order_amount_total' : {
      'type': 'int',
      'notNull': true
    },
    'order_status' : {
      'type' : 'string',
      'length': 30
    },
    'payment_status' : {
      'type': 'string',
      'length': 30,
      'notNull': true
    },
    'payment_reference' : {
      'type': 'string',
      'length': 100
    },
    'payment_mode' : {
      'type': 'string', 
      'length': 30
    },
    'payment_amount_total' : {
      'type': 'int'
    },
    'payment_confirmed_on': {
      'type': 'datetime'
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
  return db.dropTable('orders');
};

exports._meta = {
  "version": 1
};
