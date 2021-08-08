const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');

const { BlacklistedToken } = require('../../models');
const { getUserByEmail } = require('../../dal/users');
const { getCustomerByUserId } = require('../../dal/customers');
const UserServices  = require('../../services/UserServices');
const { checkIfAuthenticatedJWT } = require('../../middlewares');
const { createCustomerRegistrationForm, createCustomerEditForm } = require('../../forms/customers');


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
            res.status(401);
            res.json({
                'error': 'Wrong credentials provided.'
            })
        }
    } catch (e) {
        console.log(e);
        res.status(400);
        res.json({
            'error': "Login failed."
        });
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    console.log("API called>> get profile")
    const userId = req.user.id;
    const customer = await getCustomerByUserId(userId);
    
    if (!customer) { 
        return res.status(404); 
    }
    res.status(200);
    res.send(customer);
})

router.post('/profile', async (req, res) => {
    console.log("API called>> post profile - register customer user")
    const customerForm = createCustomerRegistrationForm();
    customerForm.handle(req, {
        'empty': async(form) => {
            console.log("empty form")
            res.status(403);
            res.json({
                'error': "Empty form"
            });
        },
        'success': async(form) => {
            const { email, password, confirm_password, ... customerData } = form.data;

            // check if user already exists
            let duplicateUser = await getUserByEmail(email);
            if (duplicateUser) {
                console.log("profile duplicate")
                res.status(302);
                res.json({
                    'error': "Credentials already exists."
                });
            } else {
                // create customer as user 
                try {
                    const userServices = new UserServices(null);
                    await userServices.registerCustomerUser(email, password, customerData);
                    console.log("register successful")
                    res.status(200);
                    res.json({
                        'message': "Customer registered successfully."
                    });
                } catch (error) {
                    console.log("Create New Customer error: ", error)
                    res.status(500);
                    res.json({
                        'error': "Server error. Please check with Administrator."
                    })
                }                
            }
        },
        'error': async(form) => {
            let errors = {};
            for (let key in form.fields) {
                if (form.fields[key].error) {
                    errors[key] = form.fields[key].error;
                }
            }
            console.log("form errors", errors)
            res.status(400);
            res.json({'error': errors});
        }
    })
})

// save edited profile
router.put('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    const userId = req.user.id;
    console.log("API called>> put profile - edit customer user")
    const customerForm = createCustomerEditForm();
    customerForm.handle(req, {
        'empty': async(form) => {
            console.log("empty form")
            res.status(403);
            res.json({
                'error': "Empty form"
            });
        },
        'success': async(form) => {
            const { email, ...customerData } = form.data;

            try {
                const userServices = new UserServices(userId);
                let customer = await userServices.saveCustomerProfile(email, customerData);
                if (customer) {
                    res.status(200);
                    res.json({
                        'message': "Profile saved successfully."
                    });                    
                } 
            } catch (error) {
                console.log("Edit Customer error: ", error)
                res.status(500);
                res.json({
                    'error': "Server error. Please check with Administrator."
                })
            }                
        },
        'error': async(form) => {
            let errors = {};
            for (let key in form.fields) {
                if (form.fields[key].error) {
                    errors[key] = form.fields[key].error;
                }
            }
            console.log("form errors", errors)
            res.status(400);
            res.json({'error': errors});
        }
    })
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

router.post('/forget_password', async(req, res) => {
    const email = req.body.email;
    console.log("API called forget_password get token", req.body);

    // get Customer by email
    const user = await getUserByEmail(email);

    if (user) {
        // if found, generate token
        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '1h');
        console.log("token generated for forget password")
        res.status(200);
        res.json({
            accessToken, 
            userName : user.get('name')
        })

    } else {
        res.status(401);
        res.json({
            'error': 'Wrong credentials provided.'
        })
    }
})

// router.put('/reset_password', checkIfAuthenticatedJWT, async (req, res) => {
//     const userId = req.user.id;

//     console.log("API called>> change password for user", userId)

//     const userForm = createResetPasswordForm();
//     if (!oldPassword || !newPassword) {
//         res.status(400)
//         res.send("Missing credentials")
//         return;
//     }
//     try {
//         const userServices = new UserServices(userId);
//         let user = await userServices.changePassword(oldPassword, newPassword);
//         if (user) {
//             res.status(200);
//             res.send("Password successfully changed.")  
//         } else {
//             res.status(403);
//             console.log("Wrong credentials.")
//             res.send("Wrong credentials provided. Please try again.")
//         }

//     } catch (e) {
//         res.status(400);
//         res.send("Failed changing password. Please try again.")
//     }
// })


module.exports = router;
