const { Client } = require('whatsapp-web.js');
const { body, validationResult } = require('express-validator');

const qrcode = require('qrcode');

const fs = require('fs');

const { phoneNumberFormatter } = require('./helper/formatter');
const ChatHistory = require('./model/chatHistory');

module.exports = function (app, io) {

    const sessions = [];
    const SESSIONS_FILE = './session/whatsapp-sessions.json';

    const createSessionsFileIfNotExists = function () {
        if (!fs.existsSync(SESSIONS_FILE)) {
            try {
                fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
                console.log('Sessions file created successfully.');
            } catch (err) {
                console.log('Failed to create sessions file: ', err);
            }
        }
    }

    createSessionsFileIfNotExists();

    const setSessionsFile = function (sessions) {
        fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions), function (err) {
            if (err) {
                console.log(err);
            }
        });
    }

    const getSessionsFile = function () {
        return JSON.parse(fs.readFileSync(SESSIONS_FILE));
    }

    const createSession = function (id, description) {
        console.log('Creating session: ' + id);
        const SESSION_FILE_PATH = `./session/whatsapp-session-${id}.json`;
        let sessionCfg;

        if (fs.existsSync(SESSION_FILE_PATH)) {
            sessionCfg = require(SESSION_FILE_PATH);
        }

        const client = new Client({
            restartOnAuthFail: true,
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process', // <- this one doesn't works in Windows
                    '--disable-gpu'
                ],
            },
            session: sessionCfg
        });

        client.initialize();

        if (!fs.existsSync(SESSION_FILE_PATH)) {
            client.on('qr', (qr) => {
                console.log('QR RECEIVED', qr);
                qrcode.toDataURL(qr, (err, url) => {
                    io.emit('qr', { id: id, src: url });
                    io.emit('message', { id: id, text: 'QR Code received, scan please!' });
                });
            });
        }

        client.on('ready', () => {
            io.emit('ready', { id: id });
            io.emit('message', { id: id, text: 'Whatsapp is ready!' });

            const savedSessions = getSessionsFile();
            const sessionIndex = savedSessions.findIndex(sess => sess.id == id);
            savedSessions[sessionIndex].ready = true;
            setSessionsFile(savedSessions);
        });

        if (!fs.existsSync(SESSION_FILE_PATH)) {
            client.on('authenticated', (session) => {
                io.emit('authenticated', { id: id });
                io.emit('message', { id: id, text: 'Whatsapp is authenticated!' });
                sessionCfg = session;
                fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            });
        }

        client.on('auth_failure', function (session) {
            io.emit('message', { id: id, text: 'Auth failure, restarting...' });
        });

        client.on('disconnected', (reason) => {
            io.emit('message', { id: id, text: 'Whatsapp is disconnected!' });
            fs.unlinkSync(SESSION_FILE_PATH, function (err) {
                if (err) return console.log(err);
                console.log('Session file deleted!');
            });
            client.destroy();
            client.initialize();

            // Menghapus pada file sessions
            const savedSessions = getSessionsFile();
            const sessionIndex = savedSessions.findIndex(sess => sess.id == id);
            savedSessions.splice(sessionIndex, 1);
            setSessionsFile(savedSessions);

            io.emit('remove-session', id);
        });

        // Tambahkan client ke sessions
        sessions.push({
            id: id,
            description: description,
            client: client
        });

        // Menambahkan session ke file
        const savedSessions = getSessionsFile();
        const sessionIndex = savedSessions.findIndex(sess => sess.id == id);

        if (sessionIndex == -1) {
            savedSessions.push({
                id: id,
                description: description,
                ready: false,
            });
            setSessionsFile(savedSessions);
        }
    }

    const destroySession = function (username) {
        const SESSION_FILE_PATH = `./session/whatsapp-session-${username}.json`;

        const user = sessions.find(sess => sess.id == username);

        if (user != null) {
            const client = sessions.find(sess => sess.id == username).client;
            fs.unlinkSync(SESSION_FILE_PATH, function (err) {
                if (err) return console.log(err);
                console.log('Session file deleted!');
            });

            client.destroy();
            client.initialize();

            // Menghapus pada file sessions
            const savedSessions = getSessionsFile();
            const sessionIndex = savedSessions.findIndex(sess => sess.id == username);
            savedSessions.splice(sessionIndex, 1);
            setSessionsFile(savedSessions);

            io.emit('remove-session', username);
        }
    }

    const init = function (socket) {
        const savedSessions = getSessionsFile();

        if (savedSessions.length > 0) {
            if (socket) {
                socket.emit('init', savedSessions);
            } else {
                savedSessions.forEach(sess => {
                    createSession(sess.id, sess.description);
                });
            }
        }
    }

    init();

    // Socket IO
    io.on('connection', function (socket) {
        init(socket);

        socket.on('create-session', function (data) {
            console.log('Create session: ' + data.id);
            createSession(data.id, data.description);
        });

        socket.on('kill-session', function (data) {

            destroySession(data.id)
        });

        // socket.on('wa-message', function (data) {

        //     const sender = data.sender;
        //     const number = phoneNumberFormatter(data.number);
        //     const message = data.message;

        //     const client = sessions.find(sess => sess.id == sender).client;

        //     client.sendMessage(number, message).then(response => {
        //         console.log({
        //             status: true,
        //             response: response
        //         });
        //     }).catch(err => {
        //         console.log({
        //             status: false,
        //             response: err
        //         });
        //     });
        // });
    });

    app.get('/destroy/:id', (req, res) => {
        var id = req.params.id

        destroySession(id);

        req.flash("alertMessage", "Success delete data User");
        req.flash("alertStatus", "warning");
        res.redirect("/user");
    });

    app.post('/wa', (req, res) => {
        let tipe = req.body.tipe
        let pesan = req.body.pesan
        let wilayah = req.body.wilayah
        let body = ""

        if (tipe === "1") {
            if (pesan === "") {
                body = "Admin || Pesanan Baru !! Mohon cek Laman Admin !!"
            }
        } else if (tipe === "2") {
            if (pesan === "") {
                body = "Kurir || Pesanan Baru !! Mohon cek Laman Pesanan !!"
            }
        } else {
            body = pesan
        }

        const client = sessions.find(sess => sess.id == 'admin').client;

        if (wilayah == "purwosari") {
            client.sendMessage("6285815421118-1614597478@g.us", body)
                .then(() => {
                    console.log("Send Success");
                    res.json({
                        'wilayah': 'purwosari',
                        'data': body
                    })
                });
        } else {
            client.sendMessage("6285815421118-1612822412@g.us", body)
                .then(() => {
                    console.log("Send Success");
                    res.json({
                        'wilayah': 'rembang',
                        'data': body
                    })
                });
        }
    })

    // Send message
    app.post('/send-message', [
        body('number').notEmpty(),
        body('message').notEmpty(),
        body('sender').notEmpty(),
    ], async (req, res) => {
        const errors = validationResult(req).formatWith(({
            msg
        }) => {
            return msg;
        });

        if (!errors.isEmpty()) {
            return res.status(422).json({
                status: false,
                message: errors.mapped()
            });
        }
        const sender = req.body.sender;
        const number = phoneNumberFormatter(req.body.number);
        const message = req.body.message;

        const client = sessions.find(sess => sess.id == sender).client;

        client.sendMessage(number, message).then(response => {
            try {
                ChatHistory.create({
                    username: sender,
                    number_send: number,
                    message: message
                }).then(res => {
                    console.log(res);
                });
            } catch (error) {
                console.log(error);
            }

            res.status(200).json({
                status: true,
                response: response
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                response: err
            });
        });
    });
}