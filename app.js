const express = require('express');

const http = require('http');

const port = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);

// Configure
require('./config/config')(app, express)

// WA
require('./whats-app').initIo(server)
require('./whats-app').createSessionsFileIfNotExists()
require('./whats-app').initWhatsApp()
require('./whats-app').routes(app)

// require('./app/controllers/home').initIo(server)

// error handler
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        console.log('error', {
            message: err.message,
            error: err
        });
    });
}

try {
    server.listen(port, () => console.log(`Server listen on http://localhost:${port}`))
} catch (error) {
    console.error('Unable to start server:', error);
}
