// import jwt from 'jsonwebtoken';
const jwt = require('jsonwebtoken');
const config = require('../config.json')
module.exports = function(req, res, next) {
    const accessToken = req.headers['x-access-token'];
    if (accessToken) {
        try {
            const decoded = jwt.verify(accessToken, config.secret);
            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                message: 'Invalid accessToken'
            });
        }
    } else {
        return res.status(401).json({
            message: 'AccessToken not found.'
        })
    }
}