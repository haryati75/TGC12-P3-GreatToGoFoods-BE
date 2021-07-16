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
  return db.createTable('brands', {
    'id': { 'type': 'int', 'unsigned': true, 'primaryKey': true, 'autoIncrement': true },
    'name': {
      'type': 'string',
      'length': 150,
      'notNull': true
    },
    'logo_image_url': {
      'type': 'string'
    },
    'description': {
      'type': 'text'
    }
  });
};

exports.down = function(db) {
  return db.dropTable('brands');
};

exports._meta = {
  "version": 1
};
