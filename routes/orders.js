const express = require('express');
const router = express.Router();

// import the model and DAL
const { getAllOrders } = require('../dal/orders');

router.get('/', async (req, res) => {
    let orders = await getAllOrders();
    res.render('orders/index', {
        'orders': orders.toJSON()
    })
})

module.exports = router