const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');

const { BlacklistedToken } = require('../../models');
const { getUserByEmail } = require('../../dal/users');
const { getCustomerByUserId } = require('../../dal/customers');
const UserServices  = require('../../services/UserServices');
const { checkIfAuthenticatedJWT } = require('../../middlewares');


const generateAccessToken = (user, secret, expiresIn) => {
    return jwt.sign({
        'username': user.get('name'),
        'id': user.get('id'),
        'email': user.get('email')
    }, secret, {
        expiresIn
    });
}

router.post('/login', async (req, res) => {
    console.log("API called>> login")
    try {
        const email = req.body.email;
        const user = await getUserByEmail(email);
        const userServices = new UserServices(user.get('id'));
        let result = await userServices.isPasswordMatch(req.body.password)
        if (result === true) {
            let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '1d');
            let refreshToken = generateAccessToken(user, process.env.REFRESH_TOKEN_SECRET, '1d');
            // save login datetime
            user.set('last_login_on', new Date());
            await user.save();
            console.log("login successful")
            res.status(200);
            res.json({
                accessToken, refreshToken, 
                userName : user.get('name')
            })
        } else {
            console.log("login failed")
            res.status(401);
            res.json({
                'message': 'Wrong credentials provided.'
            })
        }
    } catch (e) {
        console.log(e);
        res.status(400);
        res.send("Login failed.")
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    console.log("API called>> profile")
    const userId = req.user.id;
    const customerProfile = await getCustomerByUserId(userId);
    
    if (!customerProfile) { res.status(403); }
    res.send(customerProfile);
})

router.post('/refresh', async (req, res) => {
    console.log("API called>> refresh")
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.status(401);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) { return res.status(403); }

        // check if the refresh token has been blacklisted
        let blacklistedToken = await BlacklistedToken.where({
            'token': refreshToken
        }).fetch({
            require: false
        })

        // if exist, means already expired through previous logout
        if (blacklistedToken) {
            res.status(401);
            return res.send('The provided refresh token has expired.')
        }

        // reload the user information from db
        let userModel = await getUserByEmail(user.email);

        let accessToken = generateAccessToken(userModel, process.env.TOKEN_SECRET, '1d');
        res.send({
            accessToken
        });
    })
})

router.post('/logout', async (req, res) => {
    console.log("API called>> logout")
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        console.log("logout error 401")
        res.status(401);
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                console.log("logout error 403")
                res.status(403);
            }
            const token = new BlacklistedToken();
            token.set('token', refreshToken);
            token.set('date_created', new Date()); 
            await token.save();
            console.log("logout successful")
            res.status(200)
            res.send({
                'message': 'Logged out successfully.'
            })
        })
    }
})

router.post('/register', async (req, res) => {
    console.log("API called>> register")
    let newUser = req.body.user;
    let newCustomer = req.body.customer;

    try {
        let duplicateUser = await getUserByEmail(user.email);
        if (duplicateUser) {
            res.status(302);
            res.send("Credentials already exists. Please try to login.");
        }
        const userServices = new UserServices(null);
        await userServices.registerCustomerUser(newUser, newCustomer);
        res.status(200);
        res.send("Customer registered successfully.");
    } catch (e) {
        console.log("Register customer failed: ", e);
        res.status(400);
        res.send("Fail to register customer.");
    }
})

router.put('/change_password', checkIfAuthenticatedJWT, async (req, res) => {
    const userId = req.user.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword; 
    console.log("API called>> change password for user", userId)
    if (!oldPassword || !newPassword) {
        res.status(400)
        res.send("Missing credentials")
        return;
    }
    try {
        const userServices = new UserServices(userId);
        let user = await userServices.changePassword(oldPassword, newPassword);
        if (user) {
            res.status(200);
            res.send("Password successfully changed.")  
        } else {
            res.status(403);
            console.log("Wrong credentials.")
            res.send("Wrong credentials provided. Please try again.")
        }

    } catch (e) {
        res.status(400);
        res.send("Failed changing password. Please try again.")
    }
})

router.put('/customer/edit', checkIfAuthenticatedJWT, async (req, res) => {
    try {
        const userServices = new UserServices(req.user.id)
        await userServices.saveCustomerProfile(req.body.userData, req.body.customerData);
        res.status(200);
        res.send("Profile saved successfully.")
    } catch (e) {
        res.status(400);
        res.send("Failed to save profile changes. Please try again.")
    }
})

module.exports = router;
