const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const Users = mongoose.model('users');

const bcrypt = require('bcrypt')
const salt = bcrypt.genSaltSync(10);

module.exports = (app) => {
    app.use('/user', router);
};

router.get('/profile', (req, res) => {
    data = {
        'title': 'Profile',
    }

    res.render('user/whatsapp', data)
})

router.get('/list', async (req, res) => {
    var users = await Users.find()

    data = {
        'title': 'List User',
        'users': users
    }

    res.render('user/list', data)
})

router.post('/add', async (req, res) => {
    const { username, name } = req.body

    if (username == '' || name == '') {
        res.json({
            message: 'Isian tidak boleh kosong'
        })
        return
    }

    var user = await Users.findOne({ $or: [{ username: username }] })

    if (user != null) {
        res.json({
            message: 'Username sudah digunakan'
        })
        return
    }

    var hash = await bcrypt.hashSync(username, salt);

    data = {
        username: username,
        name: name,
        password: hash,
        isAdmin: false
    }

    Users.create(data).then((err, result) => {
        if (err) {
            res.json(err)
        } else {
            res.json(data)
        }
    })

})