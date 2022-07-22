const mongoose = require('mongoose');
const Schema = mongoose.Schema
const userSchema = new Schema({
    username: String,
    password: String,
    name: String,
    rfToken: String,
})
module.exports = mongoose.model('users', userSchema);