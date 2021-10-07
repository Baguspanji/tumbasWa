module.exports = function (req, res, role) {
    sess = req.session;

    // console.log(sess);
    if (!sess.loggedIn) res.redirect('/login');

    if (role == 'admin') {
        if (sess.role == 'user') {
            req.flash("alertMessage", 'Anda harus login sebagai Admin!');
            req.flash("alertStatus", "danger");
            res.redirect('/login');
        }
    } else { }
}