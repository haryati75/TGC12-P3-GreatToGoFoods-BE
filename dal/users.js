// Data Access Layer: Import Model
// CRUD here
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

const createNewUser = async (userData) => {
    try {
        const user = new User({
            'name': userData.name,
            'email': userData.email,
            'password': userData.password,  // hashed password passed in userData
            'role': userData.role,
            'created_on': new Date()
        })
        await user.save();
        return user;
    } catch (e) {
        console.log("Error saving new user: ", e);
        return null;
    }
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

const saveUser = async (userData) => {
    try {
        const user = await getUserById(userData.id);
        user.set('name', userData.name);
        user.set('email', userData.email);
        user.set('password', userData.password);
        user.set('role', userData.role);
        user.set('modified_on', new Date());
        await user.save();
        return user;
    } catch (e) {
        console.log("Error save user: ", e)
        return null;
    }
}

module.exports = { getAllUsers, getUserByEmail, getUserById, createNewUser, saveUser, setUserRole, setUserPassword }