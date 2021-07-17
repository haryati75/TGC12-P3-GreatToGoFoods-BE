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
  return db.createTable('users', {
    'id': { 'type': 'int', 'unsigned': true, 'primaryKey': true, 'autoIncrement': true },
    'name': {
      'type': 'string',
      'length': 200,
      'notNull': true
    },
    'email': {
      'type': 'string',
      'notNull': true
    },
    'password': {
      'type': 'string',
      'notNull': true
    },
    'role': {
      'type': 'string',
      'length': 50,
      'notNull': true
    },
    'last_login_on': {
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
  return db.dropTable('users');
};

exports._meta = {
  "version": 1
};
