const express = require('express');
const router = express.Router();

// import in the model
const { User } = require('../models');

// import in the forms
const { bootstrapField } = require('../forms');
const { createUserRegistrationForm, createLoginForm } = require('../forms/users');

router.get('/register', (req, res) => {
    // display registration form
    const registerUserForm = createUserRegistrationForm();
    res.render('users/register', {
        'form': registerUserForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    // save new user
    const registerUserForm = createUserRegistrationForm();
    registerUserForm.handle(req, {
        'success': async (form) => {
            const user = new User({
                'name': form.data.name,
                'password': form.data.password,
                'email': form.data.email
            })
            // set the role to "Not Verified"
            user.set('role',"Not Verified");
            user.set('created_on', new Date());
            await user.save();
            req.flash("success_messages", "User registered successfully. Please wait for Admin to verify your account.")
            res.redirect('/');
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
                req.flash("error_messages", "Sorry, you have provided the wrong credentials.");
                res.redirect('/users/login');
            } else {
                // check password matches
                if (user.get('password') === form.data.password) {
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
                    res.redirect('/users/profile');
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