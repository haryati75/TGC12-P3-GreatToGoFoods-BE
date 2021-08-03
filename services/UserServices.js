const crypto = require('crypto');

const { getUserById, createNewUser, setUserRole, setUserPassword, saveUser } = require('../dal/users');
const { getCustomerByUserId, createNewCustomer, saveCustomer } = require('../dal/customers');

class UserServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    getHashedPassword = (password) => {
        if (password && password != '') {
            const sha256 = crypto.createHash('sha256');
            const hash = sha256.update(password).digest('base64');
            return hash;
        }
        return null;
    }
    
    isPasswordMatch = async (password) => {
        const user = await getUserById(this.user_id);
        if (user && user.get('password') === this.getHashedPassword(password)) {
            return true;
        } else {
            return false;
        }
    }
    
    registerUser = async (name, email, password, role) => {
        if (!email && !password) {
            console.log("Error register user: Missing credentials");
            return null;
        }
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
            if (await this.isPasswordMatch(oldPassword) === true) {
                const user = await setUserPassword(this.user_id, this.getHashedPassword(newPassword))
                console.log("Password changed.")
                return user;
            } else {
                console.log("Password did not match!!")
                return false;
            }
        } catch (e) {
            console.log("Error changing password: ", e)
            return null;
        }
    }

    registerCustomerUser = async (email, password, newCustomer) => {
        // create user for customer 
        const name = newCustomer.first_name + " " + newCustomer.last_name;
        let addedUser = await this.registerUser(name, email, password, "Customer");

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
    
    saveCustomerProfile = async (email, customerData) => {
        const name = customerData.first_name + " " + customerData.last_name;
        await saveUser(this.user_id, name, email);
        await saveCustomer(customerData);
    }

}

module.exports = UserServices;