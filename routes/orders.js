const express = require('express');
const router = express.Router();

// import the model and DAL
const { getAllOrders, getOrderByOrderId, deleteOrderItems, setOrderStatus } = require('../dal/orders');

router.get('/', async (req, res) => {
    let orders = (await getAllOrders()).toJSON();

    for (let eachOrder of orders) {
        eachOrder['orderDateStr'] = eachOrder.order_date.toLocaleDateString('en-GB')
        eachOrder['orderTotalAmountStr'] = (eachOrder.order_amount_total / 100).toFixed(2)

        for (let eachItem of eachOrder.orderItems) {
            eachItem['unitSalesPriceStr'] = (eachItem.unit_sales_price / 100).toFixed(2);
            eachItem['amountStr'] = ((eachItem.unit_sales_price * eachItem.quantity) / 100).toFixed(2);
        }
    }

    res.render('orders/index', {
        'orders': orders
    })
})

// Routes: Edit Existing Record
// ----------------------------

// set Order statuses
router.get('/:order_id/set-status/:new_status', async (req, res) => {
    const orderId = req.params.order_id;
    const order = await getOrderByOrderId(orderId);

    res.render('orders/set_status', {
        'order': order.toJSON(),
        'newStatus': req.params.new_status
    })
})

router.post('/:order_id/set-status/:new_status', async (req, res) => {
    const orderId = req.params.order_id;
    const newStatus = req.params.new_status;
    const order = await setOrderStatus(orderId, newStatus);
    console.log(order);

    req.flash("success_messages", `Updated Status for Order ${orderId}-${order.get('order_date').toLocaleDateString('en-GB')} to ${newStatus}.`);
    res.redirect('/orders');
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