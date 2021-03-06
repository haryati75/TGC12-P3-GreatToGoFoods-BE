const jwt = require('jsonwebtoken');

// To authenticate backend-users
const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user && (req.session.user.role === "Business" || req.session.user.role === "Admin")) {
        next()
    } else {
        req.flash("error_messages", "You need to sign in to access this page.");
        res.redirect('/users/login');
    }
}

// To authenticate Admin super-user for secured back-end functions
const checkIfAuthenticatedAdmin = (req, res, next) => {
    if (req.session.user) {
        if (req.session.user.role == "Admin") {
            next();
        } else {
            req.flash("error_messages", "You are not authorized to access that page. Please contact your Administrator.");
            res.redirect('/');
        }
    } else {
        req.flash("error_messages", "You are not authorized to access this page.");
        res.redirect('/users/login');
    }
}

// to authenticate login Customer-User
const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        //Bear <token>
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log("checkIfAuthenticatedJWT err 403", err)
                return res.sendStatus(403)
            }
            req.user = user;
            next();
        });
    } else {
        console.log("checkIfAuthenticatedJWT err 401 missing header auth")
        res.sendStatus(401);
    }
}

module.exports = { checkIfAuthenticated, checkIfAuthenticatedAdmin, checkIfAuthenticatedJWT }