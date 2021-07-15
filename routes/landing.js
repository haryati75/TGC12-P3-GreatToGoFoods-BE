const express = require('express');
const router = express.Router();

const viewPath = "landing/"

router.get('/', (req,res)=>{
    res.render(viewPath + "welcome")
})

router.get('/about', (req,res)=>{
    res.render(viewPath + "about-us")
})

router.get('/contact', (req,res)=>{
    res.render(viewPath + "contact-us")
})

module.exports = router;