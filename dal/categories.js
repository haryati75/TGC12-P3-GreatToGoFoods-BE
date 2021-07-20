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
const getAllCategoriesJSON = async () => {
    return await Category.fetchAll().map( category => {
        return ({ "id": category.get('id'), "name": category.get('name')  })
    });
}
const getAllCategories = async () => {
    // Caolan Forms format for fields declared with choices
    // Requires: [[ key, label ]]
    return await Category.fetchAll().map( category => {
        return ([ category.get('id'), category.get('name') ])
    });
}

module.exports = {
    getCategoryById, getAllCategories, getAllCategoriesJSON
}