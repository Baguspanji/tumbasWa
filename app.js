const express = require('express');

const http = require('http');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const app = express();

const server = http.createServer(app);
const io = socketIO(server);

// Configure
require('./config/config')(app, express)

// WA
require('./whats-app')(app, io);

app.get('/', (req, res) => {
    res.send('ok')
})

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