const Users = require('../model/user')
const Chats = require('../model/chatHistory')
const bcrypt = require('bcryptjs')

exports.dashboard = async (req, res) => {
    sess = req.session;

    if (!sess.loggedIn) res.redirect('/login');

    if (sess.role == 'admin') {
        data = {
            user: await Users.count({ role: 'user' }),
            chat: await Chats.count({})
        }
    } else {
        data = {
            chat: await Chats.count({ username: sess.username })
        }
    }

    res.locals = {
        data,
        title: 'Main View',
        message: 'This is a message'
    };

    res.render('index');
}

exports.home = (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    res.locals = {
        alert,
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
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    sess = req.session;
    const user = await Users.findOne({ _id: sess.user_id });

    res.locals = {
        alert,
        title: `Welcome ${sess.username}`,
        data: user
    };

    res.render('auth/user');
}

exports.editUser = async (req, res) => {
    require('../helper/auth')(req, res)
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    sess = req.session;
    const user = await Users.findOne({ '_id': sess.user_id });

    res.locals = {
        alert,
        title: 'Edit User',
        data: user,
    };

    res.render('auth/form');
}

exports.UpdateUser = async (req, res) => {
    require('../helper/auth')(req, res)
    try {
        const { name, password, re_password } = req.body;

        if (password !== re_password) {
            req.flash("alertMessage", "Password is not same!");
            req.flash("alertStatus", "danger");
            return res.redirect("/user-edit");
        }

        sess = req.session;
        await Users.updateOne({ '_id': sess.user_id }, { name, password: bcrypt.hashSync(password, 8) });

        req.flash("alertMessage", "Success edit data User");
        req.flash("alertStatus", "success");
        res.redirect("/user-profile");
    } catch (error) {
        req.flash("alertMessage", `${error.message}`);
        req.flash("alertStatus", "danger");
        res.redirect("/user-profile");
    }
}