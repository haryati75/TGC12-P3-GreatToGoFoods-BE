const crypto = require('crypto');

const { getUserById, createNewUser, setUserRole, setUserPassword } = require('../dal/users');
const { getCustomerByUserId } = require('../dal/customers');

class UserServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    getHashedPassword = (password) => {
        const sha256 = crypto.createHash('sha256');
        const hash = sha256.update(password).digest('base64');
        return hash;
    }
    
    isPasswordMatch = async (password) => {
        const user = await getUserById(this.user_id);
        if (user && user.get('password') === this.getHashedPassword(password)) {
            return true;
        } else {
            console.log("ERROR Password DO NOT Match!!")
            return false;
        }
    }
    
    registerUser = async (name, email, password, role) => {
        try {
            const user = await createNewUser({
                name,
                email,
                'password': this.getHashedPassword(password),
                role
            })
            this.user_id = user.get('id');
            return user;
        } catch (e) {
            console.log("Error saving new user: ", e);
            return null;
        }
    }
    
    verifyNewUser = async () => {
        // for non-Customer users to change role to "Business"
        // this allows user to login to backend system
        try {
            const user = await getUserById(this.user_id);
            if (user.get('role') != "Customer") {
                const verifiedUser = await setUserRole(this.user_id, "Business");
                return verifiedUser;
            }
            return user;
        } catch (e) {
            console.log("Error verifying user: ", e)
            return null;
        }
    }
    
    deactivateUser = async () => {
        // instead of deleting user, change the role to "Deactivated" 
        // to prevent access to the system
        try {
            const user = await setUserRole(this.user_id, "Deactivated");
            return user;
        } catch (e) {
            console.log("Error deactivating user: ", e)
            return null;
        }
    }
    
    changePassword = async (oldPassword, newPassword) => {
        try {
            if (await isPasswordMatch(this.user_id, oldPassword) === true) {
                console.log("change password!!")
                const user = await setUserPassword(this.user_id, this.getHashedPassword(newPassword))
                return user;
            }
        } catch (e) {
            console.log("Error changing password: ", e)
            return null;
        }
    }

    registerCustomerUser = async (newUser, newCustomer) => {
        // create user for customer 
        let addedUser = await this.registerUser(newUser.name, newUser.email, newUser.password, "Customer");

        // save customer record with new user_id generated
        await createNewCustomer(newCustomer, addedUser.get('id'));
    }
    
    getCustomerProfile = async () => {
        try {
            const customer = await getCustomerByUserId(this.user_id);
            return customer;
        } catch (e) {
            console.log("Error getting Customer Profile.")
            return null;
        }
    }
    
    saveCustomerProfile = async (userData, customerData) => {
        try {
            await saveUser(userData);
            await saveCustomer(customerData);
            return true;
        } catch (e) {
            console.log("Error saving edited Profile.")
            return false;
        }
    }

}

module.exports = UserServices;