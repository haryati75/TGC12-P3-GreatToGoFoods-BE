const express = require('express');
const router = express.Router();

const CartServices = require('../../services/CartServices');
const Stripe = require('stripe')(process.env.STRIPE_KEY_SECRET);
const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');

router.get('/', async (req, res) => {
    let user = {};
    let callback = req.query.callback;
    jwt.verify(req.query.token, process.env.TOKEN_SECRET, (err, result) => {
        if (err) {
            console.log("checkout JWT err 403")
            res.redirect(callback);
        }
        user = result;
        console.log("checkIfAuthenticatedJWT success")
    });
    console.log("API called >> checkout ")

    // get all the items from the cart
    const cart = new CartServices(user.id);
    const itemsJSON = await cart.getCartJSON();

    // create an Order with a "Pending" status, with related Customer details
    // will also create Order_Details from Cart_Items
    const cartOrder = await cart.createCartOrder(itemsJSON);
    // clear Cart after Order is created 
    await cart.clearCart();

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let item of itemsJSON) {
        // the keys in the lineItem objects MUST FOLLOW 
        // Stripe guideline
        const lineItem = {
            'name' : item.product.name,
            'amount': item.product.unit_base_price,
            'quantity': item.quantity,
            'currency' : "SGD" 
        }

        // check if the product has image
        if (item.product.image_url) {
            lineItem['images'] = [item.product.image_url]
        }

        lineItems.push(lineItem);
        meta.push({
            'product_id': item.product_id,
            'quantity': item.quantity
        })
    }

    // 2. create payment object
    // Create payment object
    // - payment methods (e.g. credit card),
    // - the URL to redirect to if payment is successful
    // - the URL to redirect to if payment fails
    let metaData = JSON.stringify(meta);
    const payment = {
        'client_reference_id': cartOrder.get('id'), // client reference to hold OrderId
        'customer_email': user.email,
        'payment_method_types': ['card'],
        'line_items': lineItems,
        'success_url': process.env.APP_URL + process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        'cancel_url': process.env.APP_URL + process.env.STRIPE_ERROR_URL,
        'metadata': {
            'userId': user.id,
            'orders': metaData
        }
    }

    console.log("PAYMENT with metaData", payment);

    // 3. register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment);

    console.log("created session id: ", stripeSession.id);

    res.render('checkout/index', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_KEY_PUBLISHABLE
    })
})

router.post('/process-payment', bodyParser.raw({type: 'application/json'}), async (req, res) => {

    let payload = req.body;
    console.log(payload);
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
    } catch (e) {        
        res.status(401)
        res.send({
            'error': e.message
        })

    }
    if (event.type == 'checkout.session.completed') {
        let stripeSession = event.data.object;
        console.log("From Stripe", stripeSession);

        // 1. set Order Status to Paid, copy Stripe Payment details
        let cart = new CartServices(parseInt(stripeSession.metadata.userId));
        await cart.confirmStripePaid(stripeSession);
    }
    res.send({ received: true })
})


module.exports = router;