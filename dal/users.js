// Data Access Layer: Import Model
const { User } = require('../models');

const getUserByEmail = async (email) => {
    let user = await User.where({
        email
    }).fetch({
        require: false
    })
    return user;
}

module.exports = { getUserByEmail }