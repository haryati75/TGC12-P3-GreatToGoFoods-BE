const express = require('express');
const router = express.Router();

// import in the model and services
const { Customer } = require('../models');
const { getCustomerByUserId, saveCustomer } = require('../dal/customers');
const { getUserByEmail, getUserById, saveUser } = require('../dal/users');
const UserServices  = require('../services/UserServices');

// import in the forms
const { bootstrapField } = require('../forms');
const { createCustomerRegistrationForm, createCustomerEditForm } = require('../forms/customers');

// Routes: Get All Records
// -----------------------
router.get('/', async (req, res) => {
    // fetch all the customers
    let customers = await Customer.collection().query('orderBy', 'id', 'DESC')
    .fetch({
        require: false,
        withRelated: [ 'user']
    });

    let customersJSON = customers.toJSON();

    for (let eachCustomer of customersJSON) {
        eachCustomer['createdOnStr'] = (eachCustomer.user.created_on).toLocaleString('en-SG');
        eachCustomer['lastLoginOnStr'] = eachCustomer.user.last_login_on ? (eachCustomer.user.last_login_on).toLocaleString('en-SG') : null;
    }

    // convert collection to JSON and render via hbs
    res.render('customers/index', {
        'customers': customersJSON
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
        // empty form redundant here as some fields have the required validation
        'empty': async (form) => {
            req.flash("error_messages", `Unable to register empty customer form. Please try again.`);
            res.redirect('/customers');
        },
        'success': async (form) => {
            // split the form from User and Customer data
            const { email, password, confirm_password, ...customerData } = form.data;

            try {
                let duplicateUser = await getUserByEmail(email);
                if (duplicateUser) {
                    req.flash("error_messages", "Customer Registration failed. Credential already exists.")
                    res.redirect('/users');
                } else {
                    const userServices = new UserServices(null);
                    await userServices.registerCustomerUser(email, password, customerData);
                    req.flash("success_messages", "Customer registered successfully.")
                    res.redirect('/customers');
                } 
            } catch (e) {
                console.log("Error register customer: ", e);
                req.flash("error_messages", "Failed to register customer.");
                res.redirect('/customers');
            }
        },
        'error': (form) => {
            res.render('customers/register', {
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
    const customerForm = createCustomerEditForm();
    customerForm.handle(req, {
        'empty': async (form) => {
            // empty form redundant here as some fields have the required validation
            req.flash("error_messages", `Unable to save empty customer form. Please try again`);
            res.redirect('/customers');
        },
        'success': async (form) => {
            let { email, ...customerData } = form.data;
            try {
                let user = await saveUser(userId, customerData.first_name + " " + customerData.last_name, email);
                customerData['user_id'] = userId;
                let customer = await saveCustomer(customerData);

                req.flash("success_messages", `Changes to Customer ${user.get('name')} has been saved successfully.`);
                res.redirect('/customers');            
            } catch (e) {
                console.log("Error saving customer: ", e)
                req.flash("error_messages", `Unable to save customer changes. Please try again`);
                res.redirect('/customers');
            }
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
    req.flash("success_messages", `Deleted Customer ${userName} successfully.`);
    res.redirect('/customers');
})

module.exports = router;