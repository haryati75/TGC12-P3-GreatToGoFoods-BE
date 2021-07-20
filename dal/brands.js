// Data Access Layer: Import Model
const { Brand } = require('../models');

// useful before update/delete
const getBrandById = async (brandId) => {
    const brand = await Brand.where({
        'id': brandId
    }).fetch({
        require: true
    });
    return brand;
}

// useful for rendering lists
const getAllBrands = async () => {
    return await Brand.fetchAll().map( brand => {
        return ({ id: brand.get('id'), name: brand.get('name')  })
    });
}

module.exports = {
    getBrandById, getAllBrands
}