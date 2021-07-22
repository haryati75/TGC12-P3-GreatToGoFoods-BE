const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// import in the checkAuth middleware
const { checkIfAuthenticatedAdmin } = require('../middlewares/index');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

// import in the model
const { User } = require('../models');

// import in the forms
const { bootstrapField } = require('../forms');
const { createUserRegistrationForm, createLoginForm } = require('../forms/users');

router.get('/', checkIfAuthenticatedAdmin, async (req, res) => {
    // fetch all the users
    let users = await User.collection().fetch({
        role: ["Business", "Not Verified"]
    });

    // convert collection to JSON and render via hbs
    res.render('users/index', {
        'users': users.toJSON()
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
            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            })

            if (user) {
                req.flash("error_messages", "Registration failed. Your credential already exists.")
                res.redirect('/');
            } else {
                // save new user
                user = new User({
                    'name': form.data.name,
                    'password': getHashedPassword(form.data.password),
                    'email': form.data.email
                })
                // set the role to "Not Verified"
                user.set('role',"Not Verified");
                user.set('created_on', new Date());
                await user.save();
                req.flash("success_messages", "User registered successfully. Please wait for Admin to verify your account.")
                res.redirect('/');
            }
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
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

            let user = await User.where({
                'email': form.data.email
            }).fetch({
                require: false
            })
            if (!user) {
                req.flash("error_messages", "(E19) Sorry, you have provided the wrong credentials.");
                res.redirect('/users/login');
            } else {
                // check password matches
                if (user.get('password') === getHashedPassword(form.data.password)) {

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
                        console.log("E54-Login Role Error: ", user.get('role'));
                        req.flash("error_messages", "(E54) Sorry, you have provided the wrong credentials.");
                        res.redirect('/users/login');
                    }

                } else {
                    req.flash("error_messages", "(E75) Sorry, you have provided the wrong credentials.");
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

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash("success_messages", "Goodbye");
    res.redirect("/users/login")
})

module.exports = router;