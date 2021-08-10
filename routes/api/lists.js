const express = require('express');
const router = express.Router();

const { getAllTagsJSON } = require('../../dal/tags');
const { getAllCategoriesJSON } = require('../../dal/categories');
const { getAllBrandsJSON, getBrandById } = require('../../dal/brands');

router.get('/tags', async(req, res)=> {
    res.send(await getAllTagsJSON());
})

router.get('/categories', async(req, res)=> {
    res.send(await getAllCategoriesJSON());
})

router.get('/brands', async(req, res)=> {
    res.send(await getAllBrandsJSON());
})

router.get('/brands/:brand_id', async(req, res) => {
    let brandId = req.params.brand_id;
    try {
        let brand = await getBrandById(brandId)
        if (brand) {
            res.status(200);
            res.send(brand);
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