module.exports = function (req, res, role) {
    sess = req.session;

    // console.log(sess);
    if (!sess.loggedIn) res.redirect('/login');

    if (role == 'admin') {
        if (sess.role == 'user') res.redirect('/login');
    }else{}
}