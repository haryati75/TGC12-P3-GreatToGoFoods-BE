const express = require('express');
const router = express.Router();

const { getAllTags } = require('../../dal/tags');
const { getAllCategories } = require('../../dal/categories');
const { getAllBrands } = require('../../dal/brands');

router.get('/tags', async(req, res)=> {
    res.send(await getAllTags());
})

router.get('/categories', async(req, res)=> {
    res.send(await getAllCategories());
})

router.get('/brands', async(req, res)=> {
    res.send(await getAllBrands());
})

module.exports = router;