const cors = require('express-cors')

module.exports = function (app, express) {

    // Configure
    app.use(cors({
        allowedOrigins: [
            'github.com', 'google.com'
        ]
    }))

    app.use(express.json());
    app.use(express.urlencoded({
        extended: true
    }));

    return app
}