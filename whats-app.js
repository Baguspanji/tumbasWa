const { Client, LocalAuth } = require("whatsapp-web.js");

const { body, validationResult } = require("express-validator");

const qrcode = require("qrcode");
const fs = require("fs");
const { phoneNumberFormatter } = require("./helper/formatter");

const bycript = require("bcrypt");
var salt = bycript.genSaltSync(10);

let sessions = [];
const SESSIONS_FILE = "./session/whatsapp-sessions.json";

let io;

const setSessionsFile = async (sessions) => {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions), function (err) {
        if (err) throw err;
    });
};

const getSessionsFile = () => JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));

exports.initIo = (server) => {
    io = require("socket.io")(server);
};

exports.createSessionsFileIfNotExists = () => {
    if (!fs.existsSync(SESSIONS_FILE)) {
        try {
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
            console.log("Sessions file created successfully.");
        } catch (err) {
            console.log("Failed to create sessions file: ", err);
        }
    }
};

exports.initWhatsApp = async () => {
    io.on("connection", async (socket) => {
        socket.on("create-session", async (data) => {
            console.log("Init session: " + data.username);
            let savedSessions = getSessionsFile();
            const index = savedSessions.findIndex((sess) => sess.username == data.username);
            savedSessions[index].is_use = true;

            if (savedSessions[index] != null) {
                await setSessionsFile(savedSessions);

                createSession(data.username);
            }
        });

        socket.on("initClient", async (data) => {
            const savedSessions = getSessionsFile();
            const index = savedSessions.findIndex((sess) => sess.username == data.username);

            var check = await bycript.compare(data.password, savedSessions[index].password);

            if (!check) {
                io.emit("message", {
                    username: data.username,
                    text: "Password is incorrect!",
                });
            }

            socket.emit("init", savedSessions[index]);
        });

        socket.on("kill-session", function (data) {
            destroySession(data.username);
        });
    });

    const savedSessions = getSessionsFile();
    savedSessions.forEach((sess) => {
        if (sess.is_use) createSession(sess.username);
    });
};

const createSession = async (username) => {
    console.log("Creating session: " + username);
    let sessionCfg = {
        clientId: username,
    };

    const client = new Client({
        restartOnAuthFail: false,
        puppeteer: {
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-accelerated-2d-canvas",
                "--no-first-run",
                "--no-zygote",
                "--single-process", // <- this one doesn't works in Windows
                "--disable-gpu",
            ],
        },
        authStrategy: new LocalAuth(sessionCfg),
    });

    client.initialize();

    let count_qr = 0;
    client.on("qr", async (qr) => {
        console.log("QR RECEIVED : ", qr);
        if (count_qr == 1) {
            client.destroy();

            console.log("QR Code expired");
            io.emit("qr", {
                username: username,
                src: '',
            });

            io.emit("message", {
                username: username,
                text: "QR Code expired, please reload!",
            });

            const savedSessions = getSessionsFile();
            const index = savedSessions.findIndex((sess) => sess.username == username);
            savedSessions[index].ready = false;
            savedSessions[index].is_use = false;
            await setSessionsFile(savedSessions);
        } else {
            qrcode.toDataURL(qr, (err, url) => {
                if (err) {
                    console.log("Error: ", err);
                    return;
                }
    
                io.emit("qr", {
                    username: username,
                    src: url,
                });
    
                io.emit("message", {
                    username: username,
                    text: "QR Code received, scan please!",
                });
            });
        }

        count_qr++;
    });

    client.on("ready", async () => {
        console.log("READY");
        io.emit("ready", {
            username: username,
        });

        io.emit("message", {
            username: username,
            text: "Whatsapp is ready!",
        });

        const savedSessions = getSessionsFile();
        const index = savedSessions.findIndex((sess) => sess.username == username);
        savedSessions[index].ready = true;
        await setSessionsFile(savedSessions);
    });

    client.on("authenticated", async (session) => {
        console.log("AUTHENTICATED");
        io.emit("authenticated", {
            username: username,
        });

        io.emit("message", {
            username: username,
            text: "Whatsapp is authenticated!",
        });
    });

    client.on("auth_failure", async (session) => {
        io.emit("message", {
            username: username,
            text: "Auth failure, restarting...",
        });
    });

    client.on("disconnected", async (reason) => {
        io.emit("message", {
            username: username,
            text: "Whatsapp is disconnected!",
        });

        destroySession(username);
    });

    client.on("message", async (msg) => {
        console.log(`MESSAGE RECEIVED ${username} :`, msg);
    });

    const user = sessions.findIndex((sess) => sess.username == username);

    if (sessions[user] != null) {
        sessions[user].client = client;
    } else {
        sessions.push({
            username: username,
            client: client
        })
    }

    const savedSessions = getSessionsFile();
    const index = savedSessions.findIndex(sess => sess.username == username);

    if (index == -1) {
        savedSessions[index].ready = false;
        await setSessionsFile(savedSessions);
    }
};

const destroySession = async (username) => {
    const user = sessions.findIndex((sess) => sess.username == username);

    if (sessions[user].client != null) {
        const client = sessions.find((sess) => sess.username == username).client;

        client.destroy();

        // Menghapus pada file sessions
        const savedSessions = getSessionsFile();
        const index = savedSessions.findIndex((sess) => sess.username == username);
        savedSessions[index].ready = false;
        savedSessions[index].is_use = false;
        await setSessionsFile(savedSessions);

        sessions.forEach(sess => {
            if (sess.username == username) {
                sessions[user].client = null;
            }
        })

        io.emit("remove-session", {
            username: username,
        });

        console.log("Session: " + username + " destroyed!");
    }
};

exports.routes = (app) => {
    // Send message
    app.post(
        "/send-message",
        [
            body("number").notEmpty(),
            body("message").notEmpty(),
            body("username").notEmpty(),
        ],
        async (req, res) => {
            const errors = validationResult(req).formatWith(({ msg }) => {
                return msg;
            });

            if (!errors.isEmpty()) {
                return res.status(422).json({
                    status: false,
                    message: errors.mapped(),
                });
            }

            const { username, message } = req.body;
            const number = phoneNumberFormatter(req.body.number);

            const session = sessions.find((sess) => sess.username == username);
            if (session == null) {
                return res.status(500).json({
                    status: false,
                    response: "Session of username not register.",
                });
            }

            try {
                var response = await session.client.sendMessage(number, message);

                return res.status(200).json({
                    status: true,
                    response: response,
                });
            } catch (error) {
                return res.status(500).json({
                    status: false,
                    response: error,
                });
            }
        }
    );
};