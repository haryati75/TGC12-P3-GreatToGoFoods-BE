// Data Access Layer
const { getCartItems, getCartItemByUserAndProduct, addCartItem } = require('../dal/cart_items');
const { getCustomerByUserId } = require('../dal/customers');
const { getAllOrdersByCustomerId, getOrderByOrderId, getOrderByStripeId, getPendingOrderByCustomerId, getOrderItemsByOrderId, deleteOrderItems } = require('../dal/orders');
const { getProductById } = require('../dal/products');

const { CartItem, Order, OrderItem } = require('../models')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async createCartOrder(cartItemsWithAmountJSON) {
        const customer = await getCustomerByUserId(this.user_id);
        const totalOrderAmount = this.getCartTotalAmount(cartItemsWithAmountJSON);
        const deliveryAddress = customer.get('address_blk') + " " + customer.get('address_unit') + " " 
            + customer.get('address_street_1') + " " + customer.get('address_street_2') + " " + "Singapore " + customer.get('address_postal_code')

        // check if pending Order exists
        let order = await getPendingOrderByCustomerId(customer.get('id'));

        // ensure order status and payment status are Pending 
        const orderDate = new Date();
        const deliveryDate = new Date();
        deliveryDate.setDate(orderDate.getDate() + 3);

        if (!order) {
            order = new Order({
                'customer_id' : customer.get('id'),
                'order_date' : orderDate,
                'order_amount_total': totalOrderAmount,
                'order_status' : "Pending",
                'payment_status' : "Pending",
                'delivery_date': deliveryDate,
                'delivery_address': deliveryAddress,
                'created_on': new Date()
            })
        } else {
            order.set('order_date', orderDate);
            order.set('order_amount_total', totalOrderAmount);
            order.set('order_status', "Pending");
            order.set('payment_status', "Pending");
            order.set('delivery_date', deliveryDate);
            order.set('delivery_address', deliveryAddress);
            order.set('modified_on', new Date());
        }
        await order.save()
        await this.createCartOrderDetails(order.get('id'), cartItemsWithAmountJSON);
        return order;
    }

    async createCartOrderDetails (orderId, cartItems) {
        // destroy previous order_details if exists
        await deleteOrderItems(orderId);

       // re-create order_details from cart_items
        for (const item of cartItems) {
            let newOrderItem = new OrderItem({
                'quantity': item.quantity,
                'unit_sales_price': item.product.unit_base_price,
                'created_on': new Date(),
                'product_id': item.product_id,
                'order_id': orderId
            })
            await newOrderItem.save();
        }        
        return true;
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

    async addQuantityToProduct (productId, quantityToAdd) {
        // check if the item already exist
        let cartItem = await getCartItemByUserAndProduct(this.user_id, productId);

        if (cartItem) {
            cartItem.set('quantity', cartItem.get('quantity') + quantityToAdd);
            cartItem.set('modified_on', new Date());
            await cartItem.save();
            return cartItem;
        } 
        return null;
    }

    async confirmStripePaid (stripeSession) {
        // client reference holds OrderId 
        let orderId = stripeSession.client_reference_id;
        let order = await getOrderByOrderId(orderId);
        // update order status from 'Pending' to 'Paid
        // update all payment-related fields in Order
        if (order) {
            order.set('order_status','Paid');
            order.set('payment_stripe_id', stripeSession.id);
            order.set('payment_status', stripeSession.payment_status);
            order.set('payment_reference', stripeSession.payment_intent);
            order.set('payment_mode', stripeSession.payment_method_types[0]);
            order.set('payment_amount_total', stripeSession.amount_total);
            order.set('payment_confirmed_on', new Date());
        }
        await order.save();
        this.updateStockFromOrderDetails(orderId)
        return order;
    }

    async updateStockFromOrderDetails (orderId) {
        let orderItems = await getOrderItemsByOrderId(orderId);

        for (const item of orderItems.toJSON()) {
            console.log("OrderItem stockUpdate", item.quantity, item.product.name, item.product.quantity_in_stock, item.product.quantity_to_fulfill)
            let product = await getProductById(item.product_id)
            if (product) {
                product.set('quantity_in_stock', item.product.quantity_in_stock - item.quantity);
                product.set('quantity_to_fulfill', item.product.quantity_to_fulfill + item.quantity)
                await product.save()
                console.log("Quantity updated in Product Stock")
            } else {
                console.log("Stock not updated")
            }
        }
        // OrderItems with related Products stock updated
        orderItems = await getOrderItemsByOrderId(orderId);
        return orderItems;
    }

    async clearCart () {
        let cartItems = await getCartItems(this.user_id);
        if (cartItems.length > 0) {
            cartItems = await CartItem.where({
                user_id : this.user_id
            }).destroy().then( console.log("Clear all items in cart for user >>", this.user_id) );   
        }
        return cartItems;
    }

    async getPaidOrder(stripeId) {
        let order = (await getOrderByStripeId(stripeId)).toJSON();

        order['orderDateStr'] = order.order_date.toLocaleDateString('en-GB')
        order['orderTotalAmountStr'] = (order.order_amount_total / 100).toFixed(2)

        for (let eachItem of order.orderItems) {
            eachItem['unitSalesPriceStr'] = (eachItem.unit_sales_price / 100).toFixed(2);
            eachItem['amountStr'] = ((eachItem.unit_sales_price * eachItem.quantity) / 100).toFixed(2);
        }
        return order;
    }

    async getAllOrdersByCustomer() {
        const customer = await getCustomerByUserId(this.user_id);
        let orders = (await getAllOrdersByCustomerId(customer.get('id'))).toJSON();
        console.log("CartServices getAllOrdersByCustomer", orders);

        for (let eachOrder of orders) {
            eachOrder['orderDateStr'] = eachOrder.order_date.toLocaleDateString('en-GB')
            eachOrder['orderTotalAmountStr'] = (eachOrder.order_amount_total / 100).toFixed(2)

            for (let eachItem of eachOrder.orderItems) {
                eachItem['unitSalesPriceStr'] = (eachItem.unit_sales_price / 100).toFixed(2);
                eachItem['amountStr'] = ((eachItem.unit_sales_price * eachItem.quantity) / 100).toFixed(2);
            }            
        }

        return orders;
    }
}

module.exports = CartServices;