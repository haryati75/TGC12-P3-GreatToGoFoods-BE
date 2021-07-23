const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');

const { getUserByEmail } = require('../../dal/users');
const { User } = require('../../models');
const { getHashedPassword }  = require('../../services/user_services');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

const generateAccessToken = (user) => {
    return jwt.sign({
        'username': user.get('name'),
        'id': user.get('id'),
        'email': user.get('email')
    }, process.env.TOKEN_SECRET, {
        expiresIn: "1h"
    });
}

router.post('/login', async (req, res) => {
    let email = req.body.email;
    let user = await getUserByEmail(email);
    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        let accessToken = generateAccessToken(user);
        res.send({
            accessToken
        })
    } else {
        res.send({
            'error': 'Wrong credentials provided'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    const user = req.user;
    res.send(user);
})

module.exports = router;
