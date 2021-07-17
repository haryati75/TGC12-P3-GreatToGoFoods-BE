const express = require('express');
const router = express.Router();

// import in the model
const { User } = require('../models');

// import in the forms
const { bootstrapField } = require('../forms');
const { createUserRegistrationForm } = require('../forms/users');

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

module.exports = router;