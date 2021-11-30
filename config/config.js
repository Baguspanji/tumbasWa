const cors = require('express-cors')
const expressLayouts = require('express-ejs-layouts');

const path = require('path')
const glob = require('glob')
const rootPath = path.normalize(__dirname + '/..');

const methodOverride = require('method-override');

module.exports = function (app, express) {

    // Configure
    app.use(cors({
        allowedOrigins: [
            'github.com', 'google.com'
        ]
    }))

    app.use(methodOverride("_method"));

    app.use(express.static(path.join('app/public')));

    app.set('views', path.join('app/views'))
    app.set('view engine', 'ejs')
    app.use(expressLayouts)
    app.set('layout', 'layouts/layout');

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));

    var models = glob.sync(rootPath + '/app/models/*.js');
    models.forEach(function (model) {
        require(model);
    });

    var controllers = glob.sync(rootPath + '/app/controllers/*.js');
    controllers.forEach((controller) => {
        require(controller)(app);
    });

    return app
}