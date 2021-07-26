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

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    product() {
        return this.belongsTo('Product')
    }
})

const Order = bookshelf.model('Order', {
    tableName: 'orders',
    customer() {
        return this.belongsTo('Customer');
    }
})

const OrderItem = bookshelf.model('OrderItem', {
    tableName: 'order_items',
    product() {
        return this.belongsTo('Product');
    },
    order() {
        return this.belongsTo('Order');
    }
})

const BlacklistedToken = bookshelf.model('BlacklistedToken', {
    tableName: 'blacklisted_tokens'
})

module.exports = { Product, Brand, Category, Tag, User, Customer, CartItem, Order, OrderItem, BlacklistedToken };
