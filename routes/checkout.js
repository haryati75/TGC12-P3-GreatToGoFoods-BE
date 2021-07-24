const express = require('express');
const router = express.Router();

const CartServices = require('../services/cart_services');
const Stripe = require('stripe')(process.env.STRIPE_KEY_SECRET);

const bodyParser = require('body-parser');

router.get('/', async (req, res) => {
    console.log("GTGF router checkout.js / ")
    const cart = new CartServices(req.session.user.id);

    // get all the items from the cart
    let items = await cart.getCart();

    // create an Order with a "Pending" status, with related Customer details
    const cartOrder = await cart.createCartOrder();

    // step 1 - create line items
    let lineItems = [];
    let meta = [];
    for (let item of items) {
        // the keys in the lineItem objects MUST FOLLOW 
        // Stripe guideline
        const lineItem = {
            'name' : item.related('product').get('name'),
            'amount': item.related('product').get('unit_base_price'),
            'quantity': item.get('quantity'),
            'currency' : "SGD" 
        }

        // check if the product has image
        if (item.related('product').get('image_url')) {
            lineItem['images'] = [item.related('product').get('image_url')]
        }

        lineItems.push(lineItem);
        meta.push({
            'product_id': item.get('product_id'),
            'quantity': item.get('quantity')
        })
    }

    // 2. create payment object
    // Create payment object
    // - payment methods (e.g. credit card),
    // - the URL to redirect to if payment is successful
    // - the URL to redirect to if payment fails
    let metaData = JSON.stringify(meta);
    const payment = {
        'client_reference_id': cartOrder.get('customer_id') + "-" + cartOrder.get('id'),
        'customer_email': req.session.user.email,
        'payment_method_types': ['card'],
        'line_items': lineItems,
        'success_url': process.env.BASE_URL + process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        'cancel_url': process.env.BASE_URL + process.env.STRIPE_ERROR_URL,
        'metadata': {
            'orders': metaData
        }
    }

    // console.log("PAYMENT with metaData", payment);

    // 3. register the session
    let stripeSession = await Stripe.checkout.sessions.create(payment);
    res.render('checkout/index', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_KEY_PUBLISHABLE
    })
})

router.get('/success', (req, res) => {
    req.flash("success_messages", "Payment via Stripe successful");
    res.redirect("/products")
})

router.get('/cancelled', (req, res) => {
    req.flash("error_messages", "Payment failed. Please try again.");
    res.redirect("/shopping-cart")
})

router.post('/process-payment', bodyParser.raw({type: 'application/json'}), async (req, res) => {
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
    } catch (e) {        
        console.log(e.message)
        res.send({
            'error': e.message
        })

    }
    if (event.type == 'checkout.session.completed') {
        let stripeSession = event.data.object;
        console.log("From Stripe", stripeSession);
        
        // process stripeSession {Create Order Payment here}

        // create Order Items record, save Payment details, update Order Status to "Processing"
        console.log("GTGF>> Start your order process here for", stripeSession.client_reference_id);

        // clear Cart
        let cart = new CartServices(parseInt(stripeSession.client_reference_id));
        await cart.clearCart();
    }
    res.send({ received: true })
})

module.exports = router;