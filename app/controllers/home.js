const fs = require('fs');
let io
const SESSIONS_FILE = './session/whatsapp-sessions.json';

exports.initIo = (server) => {
    io = require('socket.io')(server);
}

exports.home = (req, res) => {
    if (!fs.existsSync(SESSIONS_FILE)) {
        try {
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
            console.log('Sessions file created successfully.');
        } catch (err) {
            console.log('Failed to create sessions file: ', err);
        }
    }

    let users = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    // console.log(users);

    data = {
        'title': 'Dashboard',
        'users': users
    }

    res.render('index', data)
}