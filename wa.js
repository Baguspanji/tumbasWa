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

client.on('qr', (qr) => {
    console.log('QR : ', qr);
    qrcode.generate(qr, { small: true });
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
    client.sendMessage('6285785800430@c.us', "Server aktif!")
        // client.sendMessage('6285815421118-1614597478@g.us', "Server aktif!")
        .then(() => {
            console.log("Success");
        });
    console.log('Client is ready!');
});

client.initialize();

client.on('message', async msg => {
    if (msg.body === "$id") {
        client.sendMessage(msg.from, msg.from)
            .then(() => {
                console.log(msg);
            });
    } else if (msg.body === "$conn") {
        client.sendMessage(msg.from, "Koneksi Aman!!")
            .then(() => {
                console.log("Success");
            });
    } else if (msg.body === '$info') {
        let info = client.info;
        client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.me.user}
            Platform: ${info.platform}
            WhatsApp version: ${info.phone.wa_version}
        `);
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
            body = "Kurir || Pesanan Baru !! Mohon cek Laman Pesanan !!"
        }
    } else {
        body = pesan
    }

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

router.post('/waSend', (req, res) => {
    let nomor = req.body.nomor
    let pesan = req.body.pesan

    if (nomor.slice(0, 1) == "0") {
        nomor = 62 + nomor.slice(1, 13)
    } else if (nomor.slice(0, 1) == "+") {
        nomor = nomor.slice(1, 13)
    }

    nomor = nomor.includes('@c.us') ? nomor : `${nomor}@c.us`;

    client.sendMessage(nomor, pesan)
        .then(() => {
            console.log("Send Success");
            res.json({ nomor, pesan })
        });
})

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

module.exports = router