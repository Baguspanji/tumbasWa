const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const app = express();

const db = require('./config');

const mongoose = require('mongoose');

const server = http.createServer(app);
const io = socketIO(server);

// Configure
require('./config/config')(app, express)

// Route
require('./whats-app')(app, io);
require('./route/web')(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

try {
    server.listen(port, () => console.log(`Server listen on http://localhost:${port}`))
} catch (error) {
    console.error('Unable to start server:', error);
}

try {
    mongoose.connect(db.uri)
        .then(() => console.log("mongoDB is Connected"))
        .catch((err) => console.log(err));
} catch (error) {
    console.error('Unable to connect to the database:', error);
}