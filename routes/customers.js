const express = require('express');
const router = express.Router();

// import in the model and services
const { Customer } = require('../models');
const { getCustomerByUserId } = require('../dal/customers');
const { getUserByEmail, getUserById } = require('../dal/users');
const UserServices  = require('../services/UserServices');

// import in the forms
const { bootstrapField } = require('../forms');
const { createCustomerRegistrationForm, createCustomerEditForm } = require('../forms/customers');

// Routes: Get All Records
// -----------------------
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

// Routes: Create New Record
// -------------------------

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

// Routes: Update Existing Record
// ------------------------------

router.get('/:user_id/update', async (req, res) => {
    const userId = req.params.user_id;
    const customer = (await getCustomerByUserId(userId)).toJSON();
    console.log("get customer update email", customer.user.email);
    const customerForm = createCustomerEditForm();
    customerForm.fields.email.value = customer.user.email;
    customerForm.fields.first_name.value = customer.first_name;
    customerForm.fields.last_name.value = customer.last_name;
    customerForm.fields.contact_no.value = customer.contact_no;
    customerForm.fields.address_blk.value = customer.address_blk;
    customerForm.fields.address_unit.value = customer.address_unit;
    customerForm.fields.address_street_1.value = customer.address_street_1;
    customerForm.fields.address_street_2.value = customer.address_street_2;
    customerForm.fields.address_postal_code.value = customer.address_postal_code;
    customerForm.fields.gender.value = customer.gender;
    customerForm.fields.birth_date.value = customer.birth_date;

    res.render('customers/update', {
        'form': customerForm.toHTML(bootstrapField),
        'customer': customer
    })
})

router.post('/:user_id/update', async (req, res) => {
    const userId = req.params.user_id;
    const customer = await getCustomerByUserId(userId);

    const customerForm = createCustomerEditForm();
    customerForm.handle(req, {
        'success': async (form) => {
            let { email, ...customerData } = form.data;
            customer.set(customerData);
            customer.save();

            let user = await getUserById(userId);
            user.set('name', customer.get('first_name') + " " + customer.get('last_name'));
            user.set('email', email);
            user.save();

            req.flash("success_messages", `Changes to Customer ${user.get('name')} has been saved successfully.`);
            res.redirect('/customers');
        },
        'error': async (form) => {
            res.render('customers/update', {
                'form': form.toHTML(bootstrapField),
                'customer': customer.toJSON()
            })
        }
    })
})


// Routes: Delete Existing Record
// -------------------------------
router.get('/:user_id/delete', async (req, res) => {
    const userId = req.params.user_id;
    const user = await getUserById(userId);

    res.render('customers/delete', {
        'user': user.toJSON()
    })
})

router.post('/:user_id/delete', async (req, res) => {
    const userId = req.params.user_id;
    const user = await getUserById(userId);
    const userName = user.get('name');
    await user.destroy();
    req.flash("success_messages", `Deleted User ${userName} successfully.`);
    res.redirect('/customers');
})

module.exports = router;