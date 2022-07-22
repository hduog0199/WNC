const mongoose = require('mongoose');
const config = require('../config.json');
const connection_url = config.connectionString;
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
module.exports = mongoose