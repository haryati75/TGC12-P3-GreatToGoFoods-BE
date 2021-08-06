// Data Access Layer: Import Model
const { Product } = require('../models');

// useful before update/delete
const getProductById = async (productId) => {
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['category', 'brand', 'tags']
    });
    return product;
}

// useful for rendering lists
const getAllProductNames = async () => {
    return await Product.fetchAll().map( product => {
        return ({ id: product.get('id'), name: product.get('name')  })
    });
}

const getAllProducts = async () => {
    return await Product.fetchAll({
        require: true,
        withRelated: ['category', 'brand', 'tags']
    })
}

const updateProductQuantityToFulfil = async (productId, deltaQuantity) => {
    let product = await getProductById(productId); 
    console.log("product before update quantity to fulfill", productId, product.get('quantity_to_fulfill'))
    product.set('quantity_to_fulfill', product.get('quantity_to_fulfill') + deltaQuantity);
    product.set('date_modified', new Date());
    await product.save();
    return product;
}

module.exports = {
    getProductById, getAllProductNames, getAllProducts, updateProductQuantityToFulfil
}