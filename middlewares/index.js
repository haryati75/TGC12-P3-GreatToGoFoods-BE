const jwt = require('jsonwebtoken');

const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user && (req.session.user.role === "Business" || req.session.user.role === "Admin" || req.session.user.role === "Customer")) {
        next()
    } else {
        req.flash("error_messages", "You need to sign in to access this page.");
        res.redirect('/users/login');
    }
}

const checkIfAuthenticatedAdmin = (req, res, next) => {
    if (req.session.user) {
        if (req.session.user.role == "Admin") {
            console.log("authenticated");
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

const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        //Bear <token>
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log("checkIfAuthenticatedJWT err 403")
                return res.sendStatus(403)
            }
            req.user = user;
            console.log("checkIfAuthenticatedJWT success")
            next();
        });
    } else {
        console.log("checkIfAuthenticatedJWT err 401")
        res.sendStatus(401);
    }
}

module.exports = { checkIfAuthenticated, checkIfAuthenticatedAdmin, checkIfAuthenticatedJWT }