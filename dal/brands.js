// Data Access Layer: Import Model
const { Brand } = require('../models');

const getBrandById = async (brandId) => {
    const brand = await Brand.where({
        'id': brandId
    }).fetch({
        require: true
    });
    return brand;
}

module.exports = {
    getBrandById
}