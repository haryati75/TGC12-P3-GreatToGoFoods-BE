// Data Access Layer: Import Model
const { Tag } = require('../models');

const getTagById = async (tagId) => {
    const tag = await Tag.where({
        'id': tagId
    }).fetch({
        require: true
    });
    return tag;
}

module.exports = {
    getTagById
}