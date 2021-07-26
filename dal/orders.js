// Data Access Layer: Import Model
const { Order, OrderItem } = require('../models');

const getOrderByOrderId = async (orderId) => {
    let order = await Order.where({
        id : orderId
    }).fetch({
        require: false,
        withRelated: ['customer'] 
    })
    return order;
}

const getPendingOrderByCustomerId = async (customerId) => {
    let order = await Order.where({
        customer_id : customerId,
        order_status: "Pending"
    }).fetch({
        require: false,
        withRelated: ['customer'] 
    })
    return order;
}

const getOrderItemsByOrderId = async (orderId) => {
    let orderItems = await OrderItem.where({
        order_id : orderId
    }).fetch({
        require: false,
        withRelated: ['order', 'product']
    })
    return orderItems
}

module.exports = { getOrderByOrderId, getPendingOrderByCustomerId, getOrderItemsByOrderId }