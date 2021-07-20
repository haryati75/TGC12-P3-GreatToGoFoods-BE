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
    'unit_base_price': { 'type': 'int', defaultValue: 0 }, 
    'unit_cost': { 'type': 'int', defaultValue: 0 }, 
    'unit_of_measure': { 
      'type': 'string',
      'length': 100
    },
    'juice_serving_size_ml': { 'type': 'int', defaultValue: 0 }, 
    'kcal': { 'type': 'int', defaultValue: 0 }, 
    'protein_gm': { 'type': 'int', defaultValue: 0 }, 
    'carbs_gm': { 'type': 'int', defaultValue: 0 }, 
    'fats_gm': { 'type': 'int', defaultValue: 0 }, 
    'sugars_gm': { 'type': 'int', defaultValue: 0 }, 
    'fibre_gm': { 'type': 'int', defaultValue: 0 }, 
    'country_source': {
      'type': 'string',
      'length': 100
    },
    'quantity_in_stock': { 'type': 'int', defaultValue: 0 },
    'quantity_to_fulfill': { 'type': 'int', defaultValue: 0 },
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
