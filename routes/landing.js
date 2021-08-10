const express = require('express');
const router = express.Router();

const viewPath = "landing/"

router.get('/', (req,res)=>{
    res.render(viewPath + "welcome")
})

module.exports = router;