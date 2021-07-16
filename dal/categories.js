// Data Access Layer: Import Model
const { Category } = require('../models');

const getCategoryById = async (categoryId) => {
    const category = await Category.where({
        'id': categoryId
    }).fetch({
        require: true
    });
    return category;
}

module.exports = {
    getCategoryById
}