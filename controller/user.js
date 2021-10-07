const User = require('../model/user');
const bcrypt = require('bcryptjs')

exports.findAll = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    const users = await User.find();

    res.locals = {
        alert,
        title: 'List Users',
        users: users,
        tabel_list: '/get-user'
    };

    res.render('user');
}

exports.getUser = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    const users = await User.find();

    var list = [];
    let i = 0;

    users.forEach(user => {
        i++

        var edit = '<a href="/user/edit/' + user._id + '" class="btn btn-warning">Edit</a>'
        var hapus = '<a href="/user/delete/' + user._id + '" class="btn btn-danger">Hapus</a>'
        var row = [
            i,
            user.name,
            user.username,
            user.email,
            user.role,
            edit + ' ' + hapus
        ]
        list.push(row)
    });

    res.status(200).send({
        data: list
    })
}

exports.formAdd = (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    res.locals = {
        title: 'Tambah User',
    };

    res.render('user/form');
}

exports.create = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    try {
        const { name, username, email } = req.body;
        await User.create({ name, username, email, password: bcrypt.hashSync(username, 8), role: 'user' });
        req.flash("alertMessage", "Success add data User");
        req.flash("alertStatus", "success");
        res.redirect("/user");
    } catch (error) {
        req.flash("alertMessage", `${error.message}`);
        req.flash("alertStatus", "danger");
        res.redirect("/user");
    }

}

// exports.findOne = (req, res) => {
//     Barang
//         .findOne({
//             where: {
//                 id_barang: req.params.id
//             },
//             attributes: ['id_barang', 'nama_barang', 'harga']
//         })
//         .then((barang) => {
//             res.status(200).send({
//                 status: true,
//                 message: 'item succesfully',
//                 data: barang
//             })
//         })
//         .catch((error) => {
//             res.status(401).send({
//                 status_response: 'Bad Request',
//                 errors: error.errors
//             })
//         })
// }

exports.formEdit = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    const user = await User.findOne({ '_id': req.params.id });

    res.locals = {
        title: 'Edit User',
        data: user,
    };

    res.render('user/form');
}

exports.update = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    try {
        const { name, username, email } = req.body;
        await User.updateOne({ '_id': req.params.id }, { name, username, email });
        
        req.flash("alertMessage", "Success edit data User");
        req.flash("alertStatus", "success");
        res.redirect("/user");
    } catch (error) {
        req.flash("alertMessage", `${error.message}`);
        req.flash("alertStatus", "danger");
        res.redirect("/user");
    }
}

exports.destroy = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    try {
        const user = await User.findOne({ _id: req.params.id });
        var username = user.username;

        await user.remove();
        
        res.redirect(`/destroy/${username}`);
    } catch (error) {
        req.flash("alertMessage", `${error.message}`);
        req.flash("alertStatus", "danger");
        res.redirect("/user");
    }
}