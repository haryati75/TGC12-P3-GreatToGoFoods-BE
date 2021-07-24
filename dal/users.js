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
        console.log("Error setUserRole: ", e)
        return null;
    }   
}

const setUserPassword = async (userId, password) => {
    const user = await getUserById(userId);
    user.set('password', password);
    user.set('modified_on', new Date());
    await user.save();
    return user;
}

module.exports = { getUserByEmail, getUserById, setUserRole, setUserPassword }