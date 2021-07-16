const express = require("express");
const router = express.Router();

// import the Brand model
const { Category } = require('../models');

router.get('/', async (req, res)=> {
    // fetch all the Brands
    let categories = await Category.collection().fetch();

    // convert collection to JSON and render via hbs
    res.render('categories/index', {
        'categories': categories.toJSON()
    })
})

module.exports = router
