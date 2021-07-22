const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
const cors = require('cors');
const csrf = require('csurf');
require("dotenv").config();

// create an instance of express app
let app = express();

// app.use(cors());

// setup sessions
app.use(session({
    'store': new FileStore(),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true
}))

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(express.urlencoded({ extended: false }));

// setup flash messages
app.use(flash());

// register Flash middleware
app.use((req, res, next) => {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
})

// share the user data with hbs files
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
})

// import in the checkAuth middleware
const { checkIfAuthenticated, checkIfAuthenticatedAdmin } = require('./middlewares');

// import in routes
const landingRoutes = require('./routes/landing');
const productRoutes = require('./routes/products');
const brandRoutes = require('./routes/brands');
const categoriesRoutes = require('./routes/categories');
const tagsRoutes = require('./routes/tags');
const usersRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary');
const api = {
    lists: require('./routes/api/lists'),
    products: require('./routes/api/products')
}

// enable CSRF
// app.use(csrf());

const csrfInstance = csrf();
app.use((req, res, next) => {
    if (req.url.slice(0,5)=="/api/") {
        return next();
    }
    csrfInstance(req, res, next);
})

app.use((err, req, res, next) => {
    console.log("checking for csrf err >>", err);
    if (err && err.code == "EBADCSRFTOKEN") {
        req.flash('error_messages', 'The form has expired. Please try again');
        res.redirect('back');
    } else {
        next();
    }
})

// Share CSRF with hbsz files
app.use((req, res, next) => {
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    next();
})

async function main() {
    // Main landing page and other static contents
    app.use('/', landingRoutes);
    app.use('/products', checkIfAuthenticated, productRoutes);
    app.use('/brands', checkIfAuthenticated, brandRoutes);
    app.use('/categories', checkIfAuthenticatedAdmin, categoriesRoutes);
    app.use('/tags', tagsRoutes);
    app.use('/users', usersRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/api/lists', cors(), express.json(), api.lists);
    app.use('/api/products', cors(), express.json(), api.products);
}

main();

app.listen(3000, ()=>{
    console.log("GTGF: Server has started")
})
