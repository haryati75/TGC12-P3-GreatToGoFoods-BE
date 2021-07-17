const checkIfAuthenticated = (req, res, next) => {
    if (req.session.user && (req.session.user.role === "Business" || req.session.user.role === "Admin")) {
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

module.exports = { checkIfAuthenticated, checkIfAuthenticatedAdmin }