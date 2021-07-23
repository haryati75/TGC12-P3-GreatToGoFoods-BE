// Data Access Layer
const { getCartItems, getCartItemByUserAndProduct, addCartItem } = require('../dal/cart_items');
const { getProductById } = require('../dal/products');

const { CartItem } = require('../models')

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async getCart() {
        let cartItems = await getCartItems(this.user_id);
        return cartItems;
    }

    getCartTotalAmount(cartItems) {
        let totalAmount = cartItems.map( item => item.get('amount')).reduce((a,b)=> a + b, 0)
        return totalAmount;
    }

    async addToCart(productId, quantity) {
        // check if the item already exist
        let cartItem = await getCartItemByUserAndProduct(this.user_id, productId);

        // get the product's latest price
        let product = await getProductById(productId);
        if (!product) {
            console.log('Error: Cannot add cart item. Product not found.', productId)
            return null;
        }
        let cartItemUnitSalesPrice = product.get('unit_base_price');

        // the cart item does not exist
        if (!cartItem) {
            cartItem = await addCartItem(this.user_id, productId, quantity, cartItemUnitSalesPrice);
        } else {
            // update cart_item 
            let changedQuantity = cartItem.get('quantity') + quantity;
            cartItem.set('quantity', changedQuantity);
            cartItem.set('unit_sales_price', cartItemUnitSalesPrice);
            cartItem.set('amount', changedQuantity * cartItemUnitSalesPrice);
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
            cartItem.set('amount', cartItem.get('unit_sales_price') * newQuantity);
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