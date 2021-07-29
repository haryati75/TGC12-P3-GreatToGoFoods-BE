const express = require('express');
const router = express.Router();

const CartServices = require('../../services/cart_services');

router.get('/', async (req, res) => {
    console.log("API called >> Get Cart")
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
        totalAmount,
        totalQuantity
    })
})

router.get('/:product_id/add', async (req, res) => {
    console.log("API called>> addToCart")
    let cart = new CartServices(req.user.id);
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