// Data Access Layer: Import Model
const { Product } = require('../models');

// useful before update/delete
const getProductById = async (productId) => {
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['category', 'brand']
    });
    return product;
}

// useful for rendering lists
const getAllProductNames = async () => {
    return await Product.fetchAll().map( product => {
        return ({ id: product.get('id'), name: product.get('name')  })
    });
}

module.exports = {
    getProductById, getAllProductNames
}