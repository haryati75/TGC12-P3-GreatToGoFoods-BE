const express = require('express');
const router = express.Router();

const { getAllTagsJSON } = require('../../dal/tags');
const { getAllCategoriesJSON } = require('../../dal/categories');
const { getAllBrandsJSON } = require('../../dal/brands');

router.get('/tags', async(req, res)=> {
    res.send(await getAllTagsJSON());
})

router.get('/categories', async(req, res)=> {
    res.send(await getAllCategoriesJSON());
})

router.get('/brands', async(req, res)=> {
    res.send(await getAllBrandsJSON());
})

module.exports = router;