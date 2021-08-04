const express = require('express');
const router = express.Router();

// import in the checkAuth middleware
const { checkIfAuthenticatedAdmin } = require('../middlewares/index');

// import in the dal and services
const { getAllUsers, getUserByEmail } = require('../dal/users');
const UserServices  = require('../services/UserServices');

// import in the forms
const { bootstrapField } = require('../forms');
const { createUserRegistrationForm, createLoginForm, createChangePasswordForm } = require('../forms/users');

router.get('/', checkIfAuthenticatedAdmin, async (req, res) => {
    // fetch all the users
    let users = (await getAllUsers()).toJSON();

    for (let eachUser of users) {
        if (eachUser.role !== "Customer") {
            eachUser['isNotCustomer'] = true;
        }
    }

    // convert collection to JSON and render via hbs
    res.render('users/index', {
        'users': users
    })
})

router.get('/profile', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash("error_messages", "You do not have permission to view this page");
        res.redirect("/users/login");
    } else {
        res.render('users/profile', {
            'user': user
        })
    }
})

router.get('/change-password', (req, res) => {
    const user = req.session.user;
    if (!user) {
        req.flash("error_messages", "You do not have permission to view this page");
        res.redirect("/users/login");
    } else {
        const changePasswordForm = createChangePasswordForm();
        res.render('users/change-pwd', {
            'userName': user.name,
            'form': changePasswordForm.toHTML(bootstrapField)
        })
    }
})

router.post('/change-password', (req, res) => {
    const sessionUser = req.session.user;

    const changePasswordForm = createChangePasswordForm();
    changePasswordForm.handle(req, {
        'success': async (form) => {
            const userServices = new UserServices(sessionUser.id);
            let user = await userServices.changePassword(form.data.old_password, form.data.new_password);
            if (user) {
                req.flash("success_messages", "Password successfully changed.")
                res.redirect('/');
            } else {
                req.flash("error_messages", "Wrong credentials provided. Please try again.");
                res.redirect("/users/change-password");
            }
        },
        'error': (form) => {
            res.render('users/change-pwd', {
                'form': form.toHTML(bootstrapField),
                'userName': sessionUser.name
            })
        },
        'empty': (form) => {
            req.flash("error_messages","Please key in user details before saving.");
            res.redirect('/users/change-password');
        }
    })
})

router.get('/register', (req, res) => {
    // display registration form
    const registerUserForm = createUserRegistrationForm();
    res.render('users/register', {
        'form': registerUserForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    const registerUserForm = createUserRegistrationForm();
    registerUserForm.handle(req, {
        'success': async (form) => {
            // check if similar user email exists
            let duplicateUser = await getUserByEmail(form.data.email);
            if (duplicateUser) {
                req.flash("error_messages", "Registration failed. Your credential already exists.")
                res.redirect('/');
            }
            // save new user
            const userServices = new UserServices(null);
            await userServices.registerUser(form.data.name, form.data.email, form.data.password, "Not Verified");
            req.flash("success_messages", "User registered successfully. Admin needs to verify your account before you can login.")
            res.redirect('/');
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        },
        'empty': (form) => {
            req.flash("error_messages","Please key in user details before saving.");
            res.redirect('/users/register');
        }
    })
})

router.get('/login', (req, res) => {
    const loginForm = createLoginForm();
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', (req, res) => {

    if (req.session.user) {
        req.flash("error_messages", "Please logout first before login in");
        res.redirect("/users/logout");
        return;
    }

    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {
            // process login here

            let email = form.data.email;
            let user = await getUserByEmail(email);     

            if (!user) {
                req.flash("error_messages", "Sorry, you have provided the wrong credentials.");
                res.redirect('/users/login');
            } else {
                // check password matches
                const userServices = new UserServices(user.get('id'));
                if (await userServices.isPasswordMatch(form.data.password)) {

                    if (user.get('role') === "Business" || user.get('role') === "Admin") {

                        // add to the session that login succeed
                        // store user details to the session
                        req.session.user = {
                            'id': user.get('id'),
                            'name': user.get('name'),
                            'email': user.get('email'),
                            'last_login_on': user.get('last_login_on'), 
                            'role': user.get('role')
                        }
                        // save this session login datetime
                        user.set('last_login_on', new Date());
                        await user.save();

                        req.flash("success_messages", "Welcome back, " + user.get('name'));
                        res.redirect('/');
                    } else {
                        console.log("Login Role Error: ", user.get('role'));
                        req.flash("error_messages", "Sorry, you have provided the wrong credentials.");
                        res.redirect('/users/login');
                    }

                } else {
                    req.flash("error_messages", "Sorry, you have provided the wrong credentials.");
                    res.redirect('/users/login');
                }
            }
        },
        'error': (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please try login again.");
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:user_id/role/verify', async (req, res) => {
    const userServices = new UserServices(req.params.user_id);
    let user = await userServices.verifyNewUser();
    if (user) {
        req.flash("success_messages", "User verified for Business role access.");
        res.redirect('/users');
    } else {
        req.flash("error_messages", "Unable to update User Role to Business.");
        res.redirect('/users');
    }
})

router.get('/:user_id/role/deactivate', async (req, res) => {
    const userServices = new UserServices(req.params.user_id);
    let user = await userServices.deactivateUser();
    if (user) {
        req.flash("success_messages", "User deactivated.");
        res.redirect('/users');
    } else {
        req.flash("error_messages", "Unable to deactivate user.");
        res.redirect('/users');
    }
})


router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash("success_messages", "Goodbye");
    res.redirect("/users/login")
})

module.exports = router;