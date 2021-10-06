const Users = require('../model/user')
const bcrypt = require('bcryptjs')

exports.home = (req, res) => {
    res.locals = {
        title: 'Login Admin'
    };

    res.render('auth/login');
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });

    if (!user) {
        return res.status(404).send({
            status: false,
            message: "Error",
            data: {
                username: req.body.username
            }
        })
    }

    var passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).send({
            status: false,
            message: "Error",
            data: {
                username: username
            },
        })
    }

    sess = req.session;
    sess.username = user.username
    sess.user_id = user._id
    sess.loggedIn = true
    sess.role = user.role

    res.redirect('/')
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
}

exports.user = async (req, res) => {
    require('../helper/auth')(req, res, 'user')

    sess = req.session;
    const user = await Users.findOne({ _id: sess.user_id });

    res.locals = {
        title: `Welcome ${sess.username}`,
        data: user
    };

    res.render('auth/user');
}