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
  return db.createTable('products', {
    'id': { 'type': 'int', 'unsigned': true, 'primaryKey': true, 'autoIncrement': true },
    'SKU': {
      'type': 'string',
      'length': 20
    },
    'name': {
      'type': 'string',
      'length': 150,
      'notNull': true
    },
    'description': {
      'type': 'text'
    },
    'image_url': {
      'type': 'string',
      'length': 300
    },
    'ingredients': {
      'type': 'text'
    },
    'unit_base_price': {
      'type': 'int'
    }, 
    'unit_cost': {
      'type': 'int'
    }, 
    'unit_of_measure': {
      'type': 'string',
      'length': 100
    },
    'juice_serving_size_ml': { 'type': 'int', defaultValue: 0 }, 
    'kcal': { 'type': 'int' }, 
    'protein_gm': { 'type': 'int' }, 
    'carbs_gm': { 'type': 'int' }, 
    'fats_gm': { 'type': 'int' }, 
    'sugars_gm': { 'type': 'int' }, 
    'fibre_gm': { 'type': 'int' }, 
    'country_source': {
      'type': 'string',
      'length': 100
    },
    'quantity_in_stock': {
      'type': 'int'
    },
    'quantity_to_fulfill': {
      'type': 'int'
    },
    'date_created' : {
      'type': 'datetime',
      'notNull': true 
    },
    'date_modified' : {
      'type': 'datetime'
    }
  });
};

exports.down = function(db) {
  return db.dropTable('products');
};

exports._meta = {
  "version": 1
};
