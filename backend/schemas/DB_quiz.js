const mongoose = require('mongoose');
const kahootSchema = mongoose.Schema({
    id_user: String,
    quiz: Object
})
module.exports = mongoose.model('answercontents', kahootSchema)