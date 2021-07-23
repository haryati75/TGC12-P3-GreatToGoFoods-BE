const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');

const { getUserByEmail } = require('../../dal/users');
const { getHashedPassword }  = require('../../services/user_services');
const { checkIfAuthenticatedJWT } = require('../../middlewares');
const { BlacklistedToken } = require('../../models');

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

        // check if the refresh token has been blacklisted
        let blacklistedToken = await BlacklistedToken.where({
            'token': refreshToken
        }).fetch({
            require: false
        })

        // if exist, means already expired through previous logout
        if (blacklistedToken) {
            res.status(401);
            return res.send('The provided refresh token has expired.')
        }

        // reload the user information from db
        let userModel = await getUserByEmail(user.email);

        let accessToken = generateAccessToken(userModel, process.env.TOKEN_SECRET, '15m');
        res.send({
            accessToken
        });
    })
})

router.post('/logout', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.status(401);
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                res.status(403);
            }

            const token = new BlacklistedToken();
            token.set('token', refreshToken);
            token.set('date_created', new Date()); 
            await token.save();
            res.send({
                'message': 'Logged out successfully.'
            })
        })
    }
})

module.exports = router;
