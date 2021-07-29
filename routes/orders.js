const express = require('express');
const router = express.Router();

// import the model and DAL
const { getAllOrders, getOrderByOrderId, deleteOrderItems } = require('../dal/orders');

router.get('/', async (req, res) => {
    let orders = (await getAllOrders()).toJSON();

    for (let eachOrder of orders) {
        eachOrder['orderDateStr'] = eachOrder.order_date.toLocaleDateString('en-GB')
        eachOrder['orderAmountStr'] = (eachOrder.order_amount_total / 100).toFixed(2)
    }

    res.render('orders/index', {
        'orders': orders
    })
})

// Routes: Delete Existing Record
// -------------------------------
router.get('/:order_id/delete', async (req, res) => {
    const orderId = req.params.order_id;
    const order = await getOrderByOrderId(orderId);

    res.render('orders/delete', {
        'order': order.toJSON()
    })
})

router.post('/:order_id/delete', async (req, res) => {
    const orderId = req.params.order_id;
    const order = await getOrderByOrderId(orderId);
    await order.destroy();
    await deleteOrderItems(orderId);
    req.flash("success_messages", `Deleted Order ${orderId} and its Order Items successfully.`);
    res.redirect('/orders');
})


module.exports = router