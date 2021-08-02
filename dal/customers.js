// Data Access Layer: Import Model
const { Customer } = require('../models');

const getCustomerByUserId = async (userId) => {
    let customer = await Customer.where({
        user_id: userId
    }).fetch({
        require: false,
        withRelated: ['user']
    })
    return customer;
}

const createNewCustomer = async (customerData, userId) => {
    // Customer-User: 1-to-1 relationship 
    try {
        const customer = new Customer({
            'first_name': customerData.first_name,
            'last_name' : customerData.last_name,
            'contact_no': customerData.contact_no,
            'address_blk': customerData.address_blk,
            'address_unit': customerData.address_unit,
            'address_street_1': customerData.address_street_1,
            'address_street_2': customerData.address_street_2,
            'address_postal_code': customerData.address_postal_code,
            'gender': customerData.gender,
            'birth_date': customerData.birth_date,
            'user_id': userId
        })
        await customer.save();
        return customer;
    } catch (e) {
        console.log("Error saving new user: ", e);
        return null;
    }
}

const saveCustomer = async (customerData) => {
    try {
        const customer = await getCustomerByUserId(customerData.id);
        customer.set('first_name', customerData.first_name);
        customer.set('last_name', customerData.last_name);
        customer.set('contact_no', customerData.contact_no);
        customer.set('address_blk', customerData.address_blk);
        customer.set('address_unit', customerData.address_unit);
        customer.set('address_street_1', customerData.address_street_1);
        customer.set('address_street_2', customerData.address_street_2);
        customer.set('address_postal_code', customerData.address_postal_code);
        customer.set('gender', customerData.gender);
        customer.set('birth_date', customerData.birth_date);
        await customer.save();
        return customer;
    } catch (e) {
        console.log("DAL Error save customer: ", e)
        return null;
    }
}

module.exports = { getCustomerByUserId, createNewCustomer, saveCustomer }