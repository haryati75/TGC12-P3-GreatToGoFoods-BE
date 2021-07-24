// Data Access Layer: Import Model
const { Customer } = require('../models');

const getCustomerByUserId = async (userId) => {
    let customer = await Customer.where({
        user_id: userId
    }).fetch({
        require: false
    })
    return customer;
}

module.exports = { getCustomerByUserId }