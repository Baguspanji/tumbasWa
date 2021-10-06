const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const expressLayouts = require('express-ejs-layouts');

const session = require('express-session')
const flash = require('connect-flash')

const path = require('path');

const port = process.env.PORT || 3000;
const app = express();

const db = require('./config');

const mongoose = require('mongoose');

const server = http.createServer(app);
const io = socketIO(server);

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

var sesi = {
    secret: 'top_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {}
}

app.use(session(sesi))

app.use(express.static(path.join(__dirname, './public')));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', 'layouts/layout');

app.get('/', (req, res, next) => {
    sess = req.session;

    console.log(sess);
    if (sess.username == null) res.redirect('/login');

    res.locals = {
        title: 'Main View',
        message: 'This is a message'
    };

    res.render('index');
})

// app.get('/', (req, res) => {
//     res.sendFile('views/index-multiple.html', {
//         root: __dirname
//     });
// });

require('./whats-app')(app, io);
require('./route/web')(app)


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