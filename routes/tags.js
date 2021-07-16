const express = require("express");
const router = express.Router();

// import the Brand model
const { Tag } = require('../models');

router.get('/', async (req, res)=> {
    // fetch all the Brands
    let tags = await Tag.collection().fetch();

    // convert collection to JSON and render via hbs
    res.render('tags/index', {
        'tags': tags.toJSON()
    })
})

module.exports = router
