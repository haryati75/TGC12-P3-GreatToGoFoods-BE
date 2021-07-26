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

app.use(cors());

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
const categoryRoutes = require('./routes/categories');
const tagRoutes = require('./routes/tags');
const userRoutes = require('./routes/users');
const customerRoutes = require('./routes/customers');
const cloudinaryRoutes = require('./routes/cloudinary');
const shoppingCartRoutes = require('./routes/shoppingCart');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const api = {
    lists: require('./routes/api/lists'),
    products: require('./routes/api/products'),
    users: require('./routes/api/users')
}

// enable CSRF
// app.use(csrf());

const csrfInstance = csrf();
app.use((req, res, next) => {
    // exclude CSRF for webhooks or api
    if (req.url === '/checkout/process-payment'  || req.url.slice(0,5)=="/api/") {
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
    app.use('/categories', checkIfAuthenticatedAdmin, categoryRoutes);
    app.use('/tags', checkIfAuthenticated, tagRoutes);
    app.use('/users', userRoutes);
    app.use('/customers', checkIfAuthenticated, customerRoutes)
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/shopping-cart', shoppingCartRoutes);
    app.use('/checkout', checkoutRoutes);
    app.use('/orders', orderRoutes);

    // all routes that are part of API must specifiy to use express.json middleware
    app.use('/api/lists', express.json(), api.lists);
    app.use('/api/products', express.json(), api.products);
    app.use('/api/users', express.json(), api.users)
}

main();

app.listen(3000, ()=>{
    console.log("GTGF: Server has started")
})
