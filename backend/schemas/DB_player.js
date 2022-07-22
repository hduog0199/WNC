const mongoose = require('mongoose');
const { Socket } = require('socket.io');
const kahootSchema = mongoose.Schema({
    player: [{
        name: String,
        score: Number,
    }]
})
module.exports = mongoose.model('players', kahootSchema)