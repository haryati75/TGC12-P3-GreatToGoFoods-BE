// import the DAL
const { getOrderByOrderId, setOrderStatus } = require('../dal/orders');
const { updateProductQuantityToFulfil } = require('../dal/products');

class OrderServices {

    async processProductsFulfilment (orderItems) {
        for (let item of orderItems) {
            try {
                let product = await updateProductQuantityToFulfil(item.product_id, -(item.quantity))
                console.log("Updated product quantity to fulfill", product.get('quantity_to_fulfill'));
            } catch (e) {
                console.log("Failed update to Product Quantity to Fulfill", item.product_id, item.quantity, e)
            }
            
        } 
    }

    async changeOrderStatus(orderId, newStatus) {

        let order = (await getOrderByOrderId(orderId)).toJSON();

        if ( !order || !order.orderItems ) { return null; }

        // check Product stocks_to_fulfill in each Order Item
        let isLowStock = false;

        // (Done at Front-end Checkout - Stripe successful): 
        // when pending to paid - reduce stocks by quantity ordered (can turn to negative), increase quantity to fulfill

        // To check if need to update Product's quantity to fulfill 
        for (let eachItem of order.orderItems) {
            if ((eachItem.product.quantity_to_fulfill + eachItem.product.quantity_in_stock) < 0) {
                isLowStock = true;
                break;
            }
        }

        let setStatus = null;
        try {
            if (newStatus === "Processing") {
                if (isLowStock) {
                    setStatus = "Processing - Low Stock" // see Add Product Stock feature
                } else {
                    setStatus = "Ready to Deliver"
                }
            } else if (newStatus === "Delivering" && order.order_status !== "Delivering") {
                // even if previous status is "Ready to Deliver", recheck stock again
                // if status is already "Delivering", status quo
                // revert to processing if stock is low
                if (isLowStock) {
                    setStatus = "Processing - Low Stock"
                } else {
                    setStatus = "Delivering"
                    // add process to reduce quantity_to_fulfill from Products
                    this.processProductsFulfilment(order.orderItems);
                }
            } else if (newStatus === "Complete") {
                // to indicate customer has received their order
                if (order.order_status === "Delivering") {
                    setStatus = "Complete"
                }
            }
            if (setStatus && order.order_status !== setStatus) {
                let updatedOrder = (await setOrderStatus(orderId, setStatus)).toJSON();
                return updatedOrder;
            }
        } catch (e) {
            console.log("Failed update order status", orderId, newStatus, e)
        }
        return order; // no change to order
    }
}

module.exports = OrderServices;