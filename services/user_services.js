const crypto = require('crypto');
const { getUserById, setUserRole } = require('../dal/users');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

const verifyNewUser = async (userId) => {
    const user = await getUserById(userId);
    if (!user) {
        return null;
    } else {
        if (user.get('role') != "Customer") {
            const verifiedUser = await setUserRole(userId, "Business");
            return verifiedUser;
        } else {
            return null;
        }
    }
}

const deactivateUser = async (userId) => {
    const verifiedUser = await setUserRole(userId, "Deactivated");
    return verifiedUser;
}

module.exports = { getHashedPassword, verifyNewUser, deactivateUser }