const Chat = require('../model/chatHistory');
const { timestampToDate } = require('../helper/formatter');

exports.findAll = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = { message: alertMessage, status: alertStatus };

    const chats = await Chat.find();

    res.locals = {
        alert,
        title: 'List Chat',
        chats: chats,
        tabel_list: '/get-chat'
    };

    res.render('chat');
}

exports.getChat = async (req, res) => {
    require('../helper/auth')(req, res, 'admin')
    const chats = await Chat.find();

    var list = [];
    let i = 0;

    chats.forEach(user => {
        i++

        var row = [
            i,
            user.username,
            user.number_send,
            user.message,
            timestampToDate(user.timestamp),
        ]
        list.push(row)
    });

    res.status(200).send({
        data: list
    })
}
