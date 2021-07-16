// Data Access Layer: Import Model
const { Category } = require('../models');

// useful before update/delete
const getCategoryById = async (categoryId) => {
    const category = await Category.where({
        'id': categoryId
    }).fetch({
        require: true
    });
    return category;
}

// useful for rendering lists
const getAllCategories = async () => {
    return await Category.fetchAll().map( category => 
        [ category.get('id'), category.get('name') ]
    );
}

module.exports = {
    getCategoryById, getAllCategories
}