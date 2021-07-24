// Data Access Layer: Import Model
const { Order } = require('../models');

const getPendingOrderByCustomerId = async (customerId) => {
    let customer = await Customer.where({
        customer_id : customerId,
        order_status: "Pending"
    }).fetch({
        require: false,
        withRelated: [customer] 
    })
    return customer;
}

module.exports = { getPendingOrderByCustomerId }