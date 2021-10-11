const expressLayouts = require('express-ejs-layouts');

const session = require('express-session')
const cookieParser = require("cookie-parser")
const flash = require('connect-flash')

const cors = require('cors')

const path = require('path');

module.exports = function (app, express) {

    var sesi = {
        secret: 'top_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 3600,
            expires: new Date(Date.now() + 3600000)
        }
    }

    // Configure
    app.use(cors())
    app.use(flash())
    app.use(cookieParser())
    app.use(session(sesi))

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));


    app.use(express.static(path.join(__dirname, '../public')));

    app.set('views', path.join(__dirname, '../views'))
    app.set('view engine', 'ejs')
    app.use(expressLayouts)
    app.set('layout', 'layouts/layout');

    return app
}