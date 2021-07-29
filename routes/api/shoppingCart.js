const express = require('express');
const router = express.Router();

const { checkIfAuthenticatedJWT } = require('../../middlewares');
const CartServices = require('../services/cart_services');

router.get('/', async (req, res) => {
    let cart = new CartServices(req.session.user.id);
    let cartItems = await cart.getCartJSON();

    for (let eachItem of cartItems) {
        eachItem['unitPriceStr'] = (eachItem.product.unit_base_price / 100).toFixed(2);
        eachItem['amountStr'] = (eachItem.amount / 100).toFixed(2);
    }

    let totalAmount = (cart.getCartTotalAmount(cartItems) / 100).toFixed(2);

    res.json({
        'cartItems': cartItems,
        totalAmount
    })
})


router.get('/:product_id/add', checkIfAuthenticatedJWT, async (req, res) => {
    console.log("API called>> addToCart")
    let cart = new CartServices(req.session.user.id);
    try {
        let cartItem = cart.addToCart(req.params.product_id, 1);
        console.log('Successfully added to cart');
        res.json({
            cartItem
        })
    } catch (e) {
        res.sendStatus(403)
        res.send("Unable to add to cart");
    }
})

module.exports = router;