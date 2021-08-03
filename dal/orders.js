// Data Access Layer: Import Model
const { Order, OrderItem } = require('../models');

const getAllOrders = async () => {
    let orders = await Order.fetchAll({
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
        withRelated: ['customer', 'orderItems', 'orderItems.product'] 
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

module.exports = { getAllOrders, getOrderByOrderId, getPendingOrderByCustomerId, getOrderItemsByOrderId, setOrderStatus, deleteOrderItems }