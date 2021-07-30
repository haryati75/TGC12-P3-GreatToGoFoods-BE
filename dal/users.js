// Data Access Layer: Import Model
const { User } = require('../models');

const getAllUsers = async () => {
    let users = await User.where(
        'role', '<>', 'Customer'
    ).fetchAll({
        require: false
    })
    return users;
}

const getUserByEmail = async (email) => {
    let user = await User.where({
        email
    }).fetch({
        require: false
    })
    return user;
}

const getUserById = async (userId) => {
    let user = await User.where({
        id: userId
    }).fetch({
        require: false
    })
    return user;
}

const setUserRole = async (userId, role) => {
    try {
        const user = await getUserById(userId);
        user.set('role', role);
        user.set('modified_on', new Date());
        await user.save();
        return user;
    } catch (e) {
        console.log("Error set role: ", e)
        return null;
    }   
}

const setUserPassword = async (userId, password) => {
    try {
        const user = await getUserById(userId);
        user.set('password', password);
        user.set('modified_on', new Date());
        await user.save();
        return user;
    } catch (e) {
        console.log("Error set password: ", e)
        return null;
    }
}

module.exports = { getAllUsers, getUserByEmail, getUserById, setUserRole, setUserPassword }