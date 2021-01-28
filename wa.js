var express = require('express')
var router = express.Router()

const { Client } = require('whatsapp-web.js');

var qrcode = require('qrcode-terminal');
const fs = require('fs');

// const SESSION_FILE_PATH = './session.data.json';
// let sessionCfg;
// if (fs.existsSync(SESSION_FILE_PATH)) {
//     sessionCfg = require(SESSION_FILE_PATH);
// }

// const client = new Client({ puppeteer: { headless: true }, session: sessionCfg });
const client = new Client();

client.initialize();

client.on('qr', (qr) => {
    console.log('QR : ', qr);
   // qrcode.generate(qr);
});

// if (fs.existsSync(SESSION_FILE_PATH)) {
//     console.log("Client is ready!");
// } else {
//     client.on('authenticated', (session) => {
//         console.log('AUTHENTICATED', session);
//         sessionCfg = session;
//         fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
//             if (err) {
//                 console.error(err);
//             }
//         });
//     });
// }

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body === "$hello") {
        client.sendMessage(msg.from, "Selamat datang Admin Tumbas!!")
            .then(() => {
                console.log("Success");
            });
    } else if(msg.body === "$id") {
        client.sendMessage(msg.from, msg.from)
            .then(() => {
                console.log("Success");
            });
    }
    // client.sendMessage("6285157800430-1611653607@g.us", 'pong');
});

router.post('/wa', (req, res) => {
    let body = req.body.messages
    client.sendMessage("6285157800430-1611653607@g.us", body)
        .then(() => {
            console.log("Send Success");
        });
    res.json("Messages : ", body)
})

module.exports = router