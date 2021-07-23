const express = require('express');
const router = express.Router();

const { getAllProducts, getProductById } = require('../../dal/products');

router.get('/', async(req, res)=> {
    res.json(await getAllProducts());
})

router.get('/:product_id', async(req, res) => {
    let productId = req.params.product_id;
    try {
        let product = await getProductById(productId)
        if (product) {
            res.status(200);
            res.send(product);
        } else {
            res.status(404);
            res.send("Record Not Found");
        }
        
    } catch (err) {
        res.status(500);
        res.send("GTGF: Internal Server Error");
        console.log(err);
    }
})

module.exports = router;