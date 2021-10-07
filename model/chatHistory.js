const {Schema, model} = require('mongoose');

const chatHistoryScheme = new Schema({
    username: {
        type: String,
        required: true
    },
    number_send: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

module.exports = model("chat_history", chatHistoryScheme);