const Ajv = require('ajv')
module.exports = function(schema) {
    return function validate(req, res, next) {
        const ajv = new Ajv()
        const valid = ajv.validate(schema, req.body)
        if (!valid) {
            return res.status(400).json(ajv.errors);
        }
        next();
    }
}