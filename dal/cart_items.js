const { CartItem } = require('../models');

const getCartItems = async (userId) => {
    return await CartItem.collection()
        .where({
            'user_id' : userId
        }).fetch({
            require:false,
            withRelated: ['product','product.category', 'product.brand']
        });
}

const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        require: false
    })
}

const addCartItem = async (userId, productId, quantity, unitSalesPrice) => {
    let intQuantity = parseInt(quantity);
    let cartItem = new CartItem({
        'user_id': userId,
        'product_id': productId,
        'quantity': intQuantity,
        'unit_sales_price': unitSalesPrice,
        'amount': unitSalesPrice * intQuantity,
        'created_on': new Date()
    })
    await cartItem.save();
}


module.exports = { getCartItems, getCartItemByUserAndProduct, addCartItem }