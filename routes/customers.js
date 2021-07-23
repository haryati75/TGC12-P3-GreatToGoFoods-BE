const express = require('express');
const router = express.Router();

// import in the model and services
const { Customer, User } = require('../models');
const { getUserByEmail } = require('../dal/users');
const { getHashedPassword }  = require('../services/user_services');

// import in the forms
const { bootstrapField } = require('../forms');
const { createCustomerRegistrationForm } = require('../forms/customers');

router.get('/', async (req, res) => {
    // fetch all the customers
    let customers = await Customer.collection().fetch({
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
            let { email, password, confirm_password, ...customerData } = form.data;

            // check if similar customer's user email exists
            let user = await getUserByEmail(email);

            if (user) {
                req.flash("error_messages", "Customer Registration failed. Credential already exists.")
                res.redirect('/');
            } else {

                // save new user for customer
                // before customer table due to foreign key
                user = new User({
                    'name': form.data.first_name + " " + form.data.last_name,
                    'password': getHashedPassword(password),
                    'email': email
                });

                // set the role to "Customer" - cannot login to Backend
                user.set('role',"Customer");
                user.set('created_on', new Date());
                let addedUser = await user.save();

                // save customer record
                let transformedCustomerData = {...customerData, user_id: addedUser.get('id')}
                let customer = new Customer(transformedCustomerData)
                await customer.save();

                req.flash("success_messages", "Customer registered successfully.")
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

module.exports = router;