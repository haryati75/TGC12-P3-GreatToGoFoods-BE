// Data Access Layer
const { getCartItems, getCartItemByUserAndProduct, addCartItem } = require('../dal/cart_items');
const { getCustomerByUserId } = require('../dal/customers');
const { getOrderByOrderId, getPendingOrderByCustomerId, getOrderItemsByOrderId } = require('../dal/orders');

const { CartItem, Order, OrderItem } = require('../models')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async createCartOrder(cartItemsWithAmountJSON) {
        const customer = await getCustomerByUserId(this.user_id);
        console.log("customer id", customer.get('id'));

        const totalOrderAmount = this.getCartTotalAmount(cartItemsWithAmountJSON);

        // check if pending Order exists
        let order = await getPendingOrderByCustomerId(customer.get('id'));

        // ensure order status and payment status are Pending 
        if (!order) {
            order = new Order({
                'customer_id' : customer.get('id'),
                'order_date' : new Date(),
                'order_amount_total': totalOrderAmount,
                'order_status' : "Pending",
                'payment_status' : "Pending",
                'created_on': new Date()
            })
        } else {
            order.set('order_date', new Date());
            order.set('order_amount_total', totalOrderAmount);
            order.set('order_status', "Pending");
            order.set('payment_status', "Pending");
            order.set('modified_on', new Date());
        }
        await order.save()

        // destroy previous order_details if exists
        // re-create order_details from cart_items
        let orderItems = await getOrderItemsByOrderId(order.get('id'));

        if (orderItems) {
            // delete all
            orderItems.destroy().then(console.log("Clear previous order_items")) 
        }
        // copy cart_items into order_items
        for (const item of cartItemsWithAmountJSON) {
            let newOrderItem = new OrderItem({
                'quantity': item.quantity,
                'unit_sales_price': item.product.unit_base_price,
                'created_on': new Date(),
                'product_id': item.product_id,
                'order_id': order.get('id')
            })
            await newOrderItem.save();
        }
        return order;
    }

    async getCart() {
        let cartItems = await getCartItems(this.user_id);
        return cartItems;
    }

    async getCartJSON() {
        let cartItems = (await getCartItems(this.user_id)).toJSON();

        // compute amount per cart_item
        let computedCartItems = cartItems.map( item => {
            let amount = item.quantity * item.product.unit_base_price;
            return {...item, amount};
        })
        return computedCartItems;
    }

    getCartTotalAmount(cartItemsJSON) {
        let totalAmount = cartItemsJSON.map( item => item.amount ).reduce((a,b)=> a + b, 0)
        return totalAmount;
    }

    async addToCart(productId, quantity) {
        // check if the item already exist
        let cartItem = await getCartItemByUserAndProduct(this.user_id, productId);

        // the cart item does not exist
        if (!cartItem) {
            cartItem = await addCartItem(this.user_id, productId, quantity);
        } else {
            // update cart_item 
            let changedQuantity = cartItem.get('quantity') + quantity;
            cartItem.set('quantity', changedQuantity);
            cartItem.set('modified_on', new Date());
            await cartItem.save();
        }     
        return cartItem;
    }

    async removeFromCart (productId) {
        let cartItem = await getCartItemByUserAndProduct(this.user_id, productId);
        if (cartItem) {
            await cartItem.destroy();
            return true;
        }
        return false;
    }

    async setQuantity (productId, newQuantity) {
        // check if the item already exist
        let cartItem = await getCartItemByUserAndProduct(this.user_id, productId);

        if (cartItem) {
            cartItem.set('quantity', newQuantity);
            cartItem.set('modified_on', new Date());
            await cartItem.save();
            return cartItem;
        }
        return null;
    }

    async confirmStripePaid (stripeSession) {
        // client reference holds OrderId 
        let order = await getOrderByOrderId(stripeSession.client_reference_id);
        // update order status from 'Pending' to 'Paid
        // update all payment-related fields in Order
        if (order) {
            order.set('order_status','Paid');
            order.set('payment_status', stripeSession.payment_status);
            order.set('payment_reference', stripeSession.payment_intent);
            order.set('payment_mode', stripeSession.payment_method_types[0]);
            order.set('payment_amount_total', stripeSession.amount_total);
            order.set('payment_confirmed_on', new Date());
        }
        await order.save();
        return order;
    }

    async clearCart () {
        let cartItems = await CartItem.where({
            'user_id': this.user_id,
        }).destroy().then( console.log("Clear all items in cart for user >>", this.user_id) );   
        return cartItems;
    }
}

module.exports = CartServices;