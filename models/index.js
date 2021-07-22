const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product', {
    tableName: 'products',
    category() {
        return this.belongsTo('Category')
    },
    brand() {
        return this.belongsTo('Brand')
    },
    tags() {
        return this.belongsToMany('Tag');
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
    tableName: 'tags',
    products() {
        return this.belongsToMany('Product');
    }
})

const User = bookshelf.model('User', {
    tableName: 'users'
})

const Customer = bookshelf.model('Customer', {
    tableName: 'customers',
    user() {
        return this.belongsTo('User');
    }
})

module.exports = { Product, Brand, Category, Tag, User, Customer };
