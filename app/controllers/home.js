
let io

exports.initIo = (server) => {
    io = require('socket.io')(server);
}

exports.home = (req, res) => {
    data = {
        'title': 'Dashboard',
    }

    res.render('index', data)
}