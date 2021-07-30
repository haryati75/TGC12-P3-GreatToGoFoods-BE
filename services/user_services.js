const crypto = require('crypto');
const { User } = require('../models');
const { getUserById, setUserRole, setUserPassword } = require('../dal/users');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const isPasswordMatch = async (userId, password) => {
    const user = await getUserById(userId);
    if (user && user.get('password') === getHashedPassword(password)) {
        return true;
    } else {
        console.log("ERROR Password DO NOT Match!!")
        return false;
    }
}

const saveNewUser = async (name, email, password, role) => {
    try {
        const user = new User({
            name,
            email,
            'password': getHashedPassword(password),
            role,
            'created_on': new Date()
        })
        let savedUser = await user.save();
        return savedUser;
    } catch (e) {
        console.log("Error saving new user: ", e);
        return null;
    }
}

const verifyNewUser = async (userId) => {
    try {
        const user = await getUserById(userId);
        if (user.get('role') != "Customer") {
            const verifiedUser = await setUserRole(userId, "Business");
            return verifiedUser;
        }
        return user;
    } catch (e) {
        console.log("Error verifying user: ", e)
        return null;
    }
}

const deactivateUser = async (userId) => {
    try {
        const user = await setUserRole(userId, "Deactivated");
        return user;
    } catch (e) {
        console.log("Error deactivating user: ", e)
        return null;
    }
}

const changePassword = async (userId, oldPassword, newPassword) => {
    try {
        if (await isPasswordMatch(userId, oldPassword) === true) {
            console.log("change password!!")
            const user = await setUserPassword(userId, getHashedPassword(newPassword))
            return user;
        }
    } catch (e) {
        console.log("Error changing password: ", e)
        return null;
    }
}

module.exports = { getHashedPassword, saveNewUser, verifyNewUser, deactivateUser, isPasswordMatch, changePassword }