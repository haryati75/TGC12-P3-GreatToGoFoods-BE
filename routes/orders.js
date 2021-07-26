const express = require('express');
const router = express.Router();

// import the model and DAL
const { getAllOrders } = require('../dal/orders');

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

module.exports = router