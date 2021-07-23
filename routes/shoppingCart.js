const express = require("express");
const router = express.Router();

const CartServices = require('../services/cart_services');

router.get('/', async (req, res) => {
    let cart = new CartServices(req.session.user.id);
    res.render('carts/index', {
        'cartItems': (await cart.getCart()).toJSON()
    })
})

router.get('/:product_id/add', async (req, res) => {
    let cart = new CartServices(req.session.user.id);
    let cartItem = cart.addToCart(req.params.product_id, 1);
    if (cartItem) {
        req.flash('success_messages', 'Successfully added to cart');
        res.redirect('/shopping-cart');
    } else {
        req.flash('error_messages', 'Failed add to cart.');
        res.redirect('/shopping-cart');
    }
})

module.exports = router;