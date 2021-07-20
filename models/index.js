const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product', {
    tableName: 'products'
})

const Brand = bookshelf.model('Brand', {
    tableName: 'brands'
})

const Category = bookshelf.model('Category', {
    tableName: 'categories'
})

const Tag = bookshelf.model('Tag', {
    tableName: 'tags'
})

const User = bookshelf.model('User', {
    tableName: 'users'
})

module.exports = { Product, Brand, Category, Tag, User };
