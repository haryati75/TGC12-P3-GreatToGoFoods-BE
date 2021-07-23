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
  return db.addColumn('cart_items', 'product_id', {
    type: 'int',
      unsigned: true,
      notNull: true,
      foreignKey: {
        name: 'cart_items_product_fk',
        table: 'products',
        mapping: 'id',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        }
      }
  })
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
