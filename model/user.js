const {Schema, model} = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

const userScheme = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
});

userScheme.plugin(uniqueValidator);

module.exports = model("users", userScheme);