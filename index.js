const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);
require("dotenv").config();

// create an instance of express app
let app = express();

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
const brandRoutes = require('./routes/brands')
const categoriesRoutes = require('./routes/categories')
const tagsRoutes = require('./routes/tags')
const usersRoutes = require('./routes/users')
const api = {
    lists: require('./routes/api/lists')
}

async function main() {
    // Main landing page and other static contents
    app.use('/', landingRoutes);
    app.use('/brands', checkIfAuthenticated, brandRoutes);
    app.use('/categories', checkIfAuthenticatedAdmin, categoriesRoutes);
    app.use('/tags', checkIfAuthenticated, tagsRoutes);
    app.use('/users', usersRoutes);
    app.use('/api/lists', api.lists);
}

main();

app.listen(3000, ()=>{
    console.log("GTGF: Server has started")
})
