const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');

const { getUserByEmail } = require('../../dal/users');
const { User } = require('../../models');
const { getHashedPassword }  = require('../../services/user_services');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

const generateAccessToken = (user, secret, expiresIn) => {
    return jwt.sign({
        'username': user.get('name'),
        'id': user.get('id'),
        'email': user.get('email')
    }, secret, {
        expiresIn
    });
}

router.post('/login', async (req, res) => {
    let email = req.body.email;
    let user = await getUserByEmail(email);
    if (user && user.get('password') == getHashedPassword(req.body.password)) {

        let accessToken = generateAccessToken(user, process.env.TOKEN_SECRET, '15m');
        let refreshToken = generateAccessToken(user, process.env.REFRESH_TOKEN_SECRET, '1d');
        res.json({
            accessToken, refreshToken
        })
    } else {
        res.status(401);
        res.json({
            'error': 'Wrong credentials provided.'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    const user = req.user;
    res.send(user);
})

router.post('/refresh', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.status(401);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(403);
        }

        // reload the user information from db
        let userModel = await getUserByEmail(user.email);

        let accessToken = generateAccessToken(userModel, process.env.TOKEN_SECRET, '15m');
        res.send({
            accessToken
        });
    })
})

module.exports = router;
