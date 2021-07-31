const express = require('express');
const router = express.Router();

// import in the model and services
const { Customer } = require('../models');
const { getUserByEmail } = require('../dal/users');
const UserServices  = require('../services/UserServices');

// import in the forms
const { bootstrapField } = require('../forms');
const { createCustomerRegistrationForm } = require('../forms/customers');

router.get('/', async (req, res) => {
    // fetch all the customers
    let customers = await Customer.collection().fetch({
        require: false,
        withRelated: [ 'user']
    });

    // convert collection to JSON and render via hbs
    res.render('customers/index', {
        'customers': customers.toJSON()
    })
})

router.get('/register', (req, res) => {
    // display registration form
    const registerCustomerForm = createCustomerRegistrationForm();
    res.render('customers/register', {
        'form': registerCustomerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    const registerCustomerForm = createCustomerRegistrationForm();
    registerCustomerForm.handle(req, {
        'success': async (form) => {
            // split the form from User and Customer data
            const { email, password, confirm_password, ...customerData } = form.data;

            try {
                let duplicateUser = await getUserByEmail(email);
                if (duplicateUser) {
                    req.flash("error_messages", "Customer Registration failed. Credential already exists.")
                    res.redirect('/');
                }            
                const newUser = { 
                    'name': customerData.first_name + ' ' + customerData.last_name,
                    email,
                    password
                }
                const userServices = new UserServices(null);
                await userServices.registerCustomerUser(newUser, newCustomer);
                req.flash("success_messages", "Customer registered successfully.")
                res.redirect('/');
            } catch (e) {
                console.log("register customer error", e);
                req.flash("error_messages", "Failed to register customer.")
                res.redirect('/customers');
            }
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router;