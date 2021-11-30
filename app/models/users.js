const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Users = new Schema({
    name: String,
    username: String,
    password: String,
    isAdmin: Boolean,
});

mongoose.model('users', Users);