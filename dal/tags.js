// Data Access Layer: Import Model
const { Tag } = require('../models');

// useful before update/delete
const getTagById = async (tagId) => {
    const tag = await Tag.where({
        'id': tagId
    }).fetch({
        require: true
    });
    return tag;
}

// useful for rendering lists
const getAllTags = async () => {
    return await Tag.fetchAll().map( tag => {
        return ([ tag.get('id'), tag.get('name') ])
    });
}

const getAllTagsJSON = async () => {
    return await Tag.fetchAll().map( tag => {
        return ({ id: tag.get('id'), name: tag.get('name')  })
    });
}

module.exports = {
    getTagById, getAllTags, getAllTagsJSON
}