const fs = require('fs');
const express = require('express')
const router = express.Router()

const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const SESSION_FILE_PATH = './session.json';

let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
    puppeteer: {
        headless: true,
        // defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    },
    session: sessionCfg
});
// const client = new Client();

client.initialize();

client.on('qr', (qr) => {
    console.log('QR : ', qr);
    qrcode.generate(qr);
});

if (fs.existsSync(SESSION_FILE_PATH)) {
    console.log("Client is ready!");
} else {
    client.on('authenticated', (session) => {
        console.log('AUTHENTICATED', session);
        sessionCfg = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function(err) {
            if (err) {
                console.error(err);
            }
        });
    });
}

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body === "$hello") {
        client.sendMessage(msg.from, "Selamat datang Admin Tumbas!!")
            .then(() => {
                console.log("Success");
            });
    } else if (msg.body === "$id") {
        client.sendMessage(msg.from, msg.from)
            .then(() => {
                console.log(msg);
            });
    } else if (msg.body === "$conn") {
        client.sendMessage(msg.from, "Koneksi Aman!!")
            .then(() => {
                console.log("Success");
            });
    }
});

router.post('/wa', (req, res) => {
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
            body = "Kurir || Pesanan Baru !! Mohon cek Laman Admin !!"
        }
    } else {
        body = pesan
    }

    if (wilayah == "purwosari") {
        client.sendMessage("6285815421118-1614597478@g.us", body)
            .then(() => {
                console.log("Send Success");
                res.json(body)
            });
    } else {
        client.sendMessage("6285815421118-1612822412@g.us", body)
            .then(() => {
                console.log("Send Success");
                res.json(body)
            });
    }
})

module.exports = router