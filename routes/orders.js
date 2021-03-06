const express = require('express');
const router = express.Router();

// import the Forms
const { bootstrapField } = require('../forms');
const { updateOrderForm } = require('../forms/orders')

// import the DAL and services
const { getAllOrders, getOrderByOrderId, deleteOrderItems } = require('../dal/orders');
const OrderServices = require('../services/OrderServices');

router.get('/', async (req, res) => {
    let orders = (await getAllOrders()).toJSON();

    for (let eachOrder of orders) {
        eachOrder['orderDateStr'] = eachOrder.order_date.toLocaleDateString('en-GB')
        eachOrder['deliveryDateStr'] = eachOrder.delivery_date.toLocaleDateString('en-GB')
        eachOrder['orderTotalAmountStr'] = (eachOrder.order_amount_total / 100).toFixed(2)
        eachOrder['isBtnShowDelivering'] = eachOrder.payment_status ==="paid" && eachOrder.order_status === "Ready to Deliver" ? true : false; // if true, show Deliver
        eachOrder['isBtnShowComplete'] = eachOrder.payment_status ==="paid" && eachOrder.order_status === "Delivering" ? true : false; // if true, show Complete
        eachOrder['isBtnShowProcessing'] = eachOrder.payment_status ==="paid" && eachOrder.order_status !== "Delivering" && eachOrder.order_status !== "Complete" ? true : false; // if true,  show Process

        for (let eachItem of eachOrder.orderItems) {
            eachItem['unitSalesPriceStr'] = (eachItem.unit_sales_price / 100).toFixed(2);
            eachItem['amountStr'] = ((eachItem.unit_sales_price * eachItem.quantity) / 100).toFixed(2);
        }
    }

    res.render('orders/index', {
        'orders': orders
    })
})

// Routes: Edit Existing Record for specific fields
// ------------------------------------------------

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

    const orderServices = new OrderServices();
    try {
        const order = await orderServices.changeOrderStatus(orderId, newStatus);

        if (order) {
            console.log("successfully updated status:", order);
            req.flash("success_messages", `Updated Status for Order ${orderId} to ${order.order_status}.`);
            res.redirect('/orders');            
        } else {
            console.log("route Order Update Status", orderId, newStatus, order);
            req.flash("error_messages", `Failed to update ${newStatus} for Order: ${orderId}`);
            res.redirect('/orders');
        }      
    } catch (e) {
        console.log("error setting status for order", e);
        req.flash("error_messages", `ERROR: Server Failed to update ${newStatus} for Order: ${orderId}`);
        res.redirect('/orders');
    }

})

// Routes: Update Existing Record
// -------------------------------

router.get('/:order_id/update', async (req, res) => {
    const orderId = req.params.order_id;
    const order = await getOrderByOrderId(orderId);

    const orderForm = updateOrderForm();
    orderForm.fields.order_date.value = order.get('order_date');
    orderForm.fields.order_amount_total.value = order.get('order_amount_total');
    orderForm.fields.order_status.value = order.get('order_status');
    orderForm.fields.payment_status.value = order.get('payment_status');
    orderForm.fields.payment_reference.value = order.get('payment_reference');
    orderForm.fields.payment_stripe_id.value = order.get('payment_stripe_id');
    orderForm.fields.payment_mode.value = order.get('payment_mode');
    orderForm.fields.payment_amount_total.value = order.get('payment_amount_total');
    orderForm.fields.payment_confirmed_on.value = order.get('payment_confirmed_on');
    orderForm.fields.delivery_address.value = order.get('delivery_address');
    orderForm.fields.delivery_date.value = order.get('delivery_date');

    const orderJSON = order.toJSON();
    for (let eachItem of orderJSON.orderItems) {
        eachItem['unitSalesPriceStr'] = (eachItem.unit_sales_price / 100).toFixed(2);
        eachItem['amountStr'] = ((eachItem.unit_sales_price * eachItem.quantity) / 100).toFixed(2);
    }

    res.render('orders/update', {
        'form': orderForm.toHTML(bootstrapField),
        order : orderJSON
    })
})

router.post('/:order_id/update', async (req, res) => {
    const orderId = req.params.order_id;
    const order = await getOrderByOrderId(orderId);

    const orderForm = updateOrderForm();
    orderForm.handle(req, {
        'success': async (form) => {
            order.set(form.data);
            order.set('modified_on', new Date());
            await order.save();
            req.flash("success_messages", `Changes to Order ${order.get('id')} has been saved successfully.`);
            res.redirect('/orders');
        },
        'error': async (form) => {
            res.render('orders/update', {
                'form': form.toHTML(bootstrapField),
                'category': category.toJSON()
            })
        }
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