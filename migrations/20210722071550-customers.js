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
  return db.createTable('customers', {
    'id': { 'type': 'int', 'unsigned': true, 'primaryKey': true, 'autoIncrement': true },
    'first_name': {
      'type': 'string',
      'length': 100,
      'notNull': true
    },
    'last_name': {
      'type': 'string',
      'length': 100,
      'notNull': true
    },
    'contact_no': {
      'type': 'string',
      'length': 30,
      'notNull': true
    },
    'address_blk': {
      'type': 'string',
      'length': 10,
      'notNull': true
    },
    'address_unit': {
      'type': 'string',
      'length': 10,
      'notNull': true
    },
    'address_street_1': {
      'type': 'string',
      'length': 100,
      'notNull': true
    },
    'address_street_2': {
      'type': 'string',
      'length': 100,
      'notNull': true
    },
    'address_postal_code': {
      'type': 'string',
      'length': 10,
      'notNull': true
    },
    'gender': {
      'type': 'string',
      'length': 1
    },
    'birth_date' : {
      'type': 'date'
    }
  })
};

exports.down = function(db) {
  return db.dropTable('customers');
};

exports._meta = {
  "version": 1
};
