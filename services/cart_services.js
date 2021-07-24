// Data Access Layer
const { getCartItems, getCartItemByUserAndProduct, addCartItem } = require('../dal/cart_items');

const { CartItem } = require('../models')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
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

    async clearCart () {
        let cartItems = await CartItem.where({
            'user_id': this.user_id,
        }).destroy().then( console.log("Clear all items in cart for user >>", this.user_id) );   
        return cartItems;
    }
}

module.exports = CartServices;