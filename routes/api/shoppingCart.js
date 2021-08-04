const express = require('express');
const router = express.Router();

const CartServices = require('../../services/CartServices');
const { getCustomerByUserId } = require('../../dal/customers');

router.get('/', async (req, res) => {
    console.log("API called >> Get Cart")
    let customer = await getCustomerByUserId(req.user.id);
    let cart = new CartServices(req.user.id);
    let cartItems = await cart.getCartJSON();
    let totalQuantity = 0

    for (let eachItem of cartItems) {
        eachItem['unitPriceStr'] = (eachItem.product.unit_base_price / 100).toFixed(2);
        eachItem['amountStr'] = (eachItem.amount / 100).toFixed(2);
        totalQuantity += eachItem.quantity;
    }

    let totalAmount = (cart.getCartTotalAmount(cartItems) / 100).toFixed(2);

    res.json({
        'cartItems': cartItems,
        customer,
        totalAmount,
        totalQuantity
    })
})

router.get('/order/:order_id', async (req, res) => {
    console.log("API called>> get paid Order", req.params.order_id)
    let cart = new CartServices(req.user.id);
    try {
        let order = await cart.getCustomerOrder(req.params.order_id);
        res.json({
            order
        })
    } catch (e) {
        res.status(403);
        res.json({
            'message': "Unable to retrieve order details."
        })
    }
})

router.get('/:product_id/add', async (req, res) => {
    console.log("API called>> addToCart", req.params.product_id)
    let cart = new CartServices(req.user.id);
    try {
        let cartItem = cart.addToCart(req.params.product_id, 1);
        console.log('Successfully added to cart');
        res.status(200);
        res.json({
            cartItem
        })
    } catch (e) {
        res.sendStatus(403)
        res.send("Unable to add to cart", e);
    }
})

router.delete('/:product_id/remove', async (req, res) => {
    console.log("API called>> removeFromCart", req.params.product_id)
    let cart = new CartServices(req.user.id);
    try {
        await cart.removeFromCart(req.params.product_id);
        console.log('Successfully removed from cart');
        res.json({
            message: 'Successfully removed from cart'
        })
    } catch (e) {
        res.sendStatus(403)
        res.send("Unable to remove from cart", e);
    }
})

router.delete('/clear', async (req, res) => {
    console.log("API called>> clearCart")
    let cart = new CartServices(req.user.id);
    try {
        await cart.clearCart();
        console.log('Successfully cleared cart');
        res.json({
            message: 'Successfully cleared Shopping Cart'
        })
    } catch (e) {
        res.sendStatus(403)
        res.send("Unable to clear cart", e);
    }
})

router.post('/checkout', async (req, res) => {
    console.log("API called >> checkout")
    res.redirect('/checkout')
})

module.exports = router;