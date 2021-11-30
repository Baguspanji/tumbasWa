const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt')
const salt = bcrypt.genSaltSync(10);

const mongoose = require('mongoose');
const Users = mongoose.model('users');

module.exports = (app) => {
    app.use('/', router);
};

router.get('/login', (req, res) => {
    data = {
        'title': 'Login',
    }

    res.render('auth/login', data)
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body

    var user = await Users.findOne({ username })

    if (!user || !bcrypt.compareSync(password, user.password)) {
        // authentication failed
        res.redirect('/auth/login')
    } else {
        // authentication successful
        if (user.isAdmin) {
            res.json({
                username: user.username,
                name: user.name,
                isAdmin: true
            })
        } else {
            res.json({
                username: user.username,
                name: user.name,
                isAdmin: false
            })
        }
    }
})