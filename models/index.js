const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product', {
    tableName: 'products',
    category() {
        return this.belongsTo('Category')
    },
    brand() {
        return this.belongsTo('Brand')
    }
})

const Brand = bookshelf.model('Brand', {
    tableName: 'brands',
    products() {
        return this.hasMany('Product')
    }
})

const Category = bookshelf.model('Category', {
    tableName: 'categories',
    products() {
        return this.hasMany('Product')
    }
})

const Tag = bookshelf.model('Tag', {
    tableName: 'tags'
})

const User = bookshelf.model('User', {
    tableName: 'users'
})

module.exports = { Product, Brand, Category, Tag, User };
