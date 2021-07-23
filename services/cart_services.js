const { getCartItems, getCartItemByUserAndProduct, addCartItem } = require('../dal/cart_items');
const { getProductById } = require('../dal/products');

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async getCart() {
        let cartItems = await getCartItems(this.user_id);
        return cartItems;
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

}

module.exports = CartServices;