const express = require("express");
const router = express.Router();

// import the Brand model
const { Brand } = require('../models');

router.get('/', async (req, res)=> {
    // fetch all the Brands
    let brands = await Brand.collection().fetch();

    // convert collection to JSON and render via hbs
    res.render('brands/index', {
        'brands': brands.toJSON()
    })
})

module.exports = router
