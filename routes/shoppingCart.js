const express = require("express");
const router = express.Router();

const CartServices = require('../services/cart_services');

router.get('/', async (req, res) => {
    let cart = new CartServices(req.session.user.id);
    let cartItems = await cart.getCart();
    let totalAmount = cart.getCartTotalAmount(cartItems);

    res.render('carts/index', {
        'cartItems': cartItems.toJSON(),
        totalAmount
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

router.post('/:product_id/quantity/update', async (req, res) => {
    let cart = new CartServices(req.session.user.id);
    await cart.setQuantity(req.params.product_id, parseInt(req.body.quantity));
    req.flash("success_messages", "Quantity updated.");
    res.redirect('/shopping-cart');
})

router.get('/:product_id/remove', async (req, res) => {
    let cart = new CartServices(req.session.user.id);
    await cart.removeFromCart(req.params.product_id);
    req.flash("success_messages", "Item has been removed.");
    res.redirect('/shopping-cart')
})

router.get('/clear', async (req, res) => {
    let cart = new CartServices(req.session.user.id);
    await cart.clearCart();
    req.flash("success_messages", "Cart is cleared.");
    res.redirect('/products')
})

module.exports = router;