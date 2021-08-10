// Data Access Layer: Import Model
const { Order, OrderItem } = require('../models');

const getAllOrders = async () => {
    let orders = await Order.query('orderBy', 'id', 'DESC').fetchAll({
        require: false,
        withRelated: ['customer', 'orderItems', 'orderItems.product', 'orderItems.product.category']
    })
    return orders;
}

const getAllOrdersByCustomerId = async (customerId) => {
    let orders = await Order.query('orderBy', 'id', 'DESC').where({
        customer_id : customerId
    }).fetchAll({
        require: false,
        withRelated: ['customer', 'orderItems', 'orderItems.product', 'orderItems.product.category']
    })
    return orders;
}

const getOrderByOrderId = async (orderId) => {
    let order = await Order.where({
        id : orderId
    }).fetch({
        require: false,
        withRelated: ['customer', 'orderItems', 'orderItems.product', 'orderItems.product.category'] 
    })
    return order;
}

const getOrderByCustomerId = async (customerId) => {
    let order = await Order.where({
        customer_id : customerId
    }).fetch({
        require: false,
        withRelated: ['customer', 'orderItems', 'orderItems.product', 'orderItems.product.category'] 
    })
    return order;
}

const getOrderByStripeId = async (stripeSessionId) => {
    let order = await Order.where({
        payment_stripe_id : stripeSessionId
    }).fetch({
        require: false,
        withRelated: ['customer', 'orderItems', 'orderItems.product', 'orderItems.product.category'] 
    })
    return order;
}

const getPendingOrderByCustomerId = async (customerId) => {
    let order = await Order.where({
        customer_id : customerId,
        order_status: "Pending"
    }).fetch({
        require: false,
        withRelated: ['customer', 'orderItems', 'orderItems.product'] 
    })
    return order;
}

const setOrderStatus = async (orderId, newStatus) => {
    let order = await getOrderByOrderId(orderId); 
    order.set('order_status', newStatus);
    order.set('modified_on', new Date());
    await order.save();
    return order;
}

const getOrderItemsByOrderId = async (orderId) => {
    let orderItems = await OrderItem.collection()
        .where({
            order_id : orderId
        }).fetch({
            require: false,
            withRelated: ['order', 'product']
        })
    return orderItems;
}

const deleteOrderItems = async (orderId) => {
    await OrderItem.where({
        order_id : orderId
    }).destroy({
        require: false
    }).then(console.log("Clear order_items", orderId)) ;
    return null;
}

module.exports = { 
    getAllOrders, 
    getAllOrdersByCustomerId,
    getOrderByOrderId, 
    getOrderByCustomerId,
    getOrderByStripeId,
    getPendingOrderByCustomerId, 
    getOrderItemsByOrderId, 
    setOrderStatus, 
    deleteOrderItems }