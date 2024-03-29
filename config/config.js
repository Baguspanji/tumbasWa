const cors = require('express-cors')
const expressLayouts = require('express-ejs-layouts');

const path = require('path')

module.exports = function (app, express) {

    // Configure
    app.use(cors({
        allowedOrigins: ['*']
    }))

    app.use(express.static(path.join('app/public')));

    app.set('views', path.join('app/views'))
    app.set('view engine', 'ejs')
    app.use(expressLayouts)
    app.set('layout', 'layouts/layout');

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));

    // Routes
    app.use('/', require('../app/routes'));

    return app
}