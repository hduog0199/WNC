const express = require('express');
const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rds = require('randomstring');
const User = require('../schemas/DB_user.js');
const validate = require('../middlewares/validate.middleware.js')
const router = express.Router();
const schema = {
    type: "object",
    properties: {
        username: { type: "string" },
        password: { type: "string" }
    },
    required: ["username", "password"],
    additionalProperties: false
}

const rfSchema = {
    type: "object",
    properties: {
        accessToken: { type: "string" },
        refreshToken: { type: "string" }
    },
    required: ["accessToken", "refreshToken"],
    additionalProperties: false
}

router.post('/', validate(schema), async function(req, res) {
    const user = await User.findOne({ username: req.body.username })
    console.log(user)
    if (user === null) {
        return res.status(401).json({
            authenticated: false
        });
    }
    if (bcrypt.compareSync(req.body.password, user.password) === false) {
        return res.status(401).json({
            authenticated: false
        });
    }

    const payload = {
        userID: user.id
    };

    const opts = {
        expiresIn: 60
    }

    const accessToken = jwt.sign(payload, config.secret, opts)

    const refreshToken = rds.generate(80);
    await User.updateOne({ _id: user._id }, {
        rfToken: refreshToken
    })

    res.json({
        authenticated: true,
        accessToken,
        refreshToken
    });
})

router.post('/refresh', validate(rfSchema), async function(req, res) {
    const { accessToken, refreshToken } = req.body;
    console.log(accessToken)
    console.log(refreshToken)
    try {
        const opts = {
            ignoreExpiration: true
        };
        const { userID } = jwt.verify(accessToken, config.secret, opts);
        console.log({ userID })
        User.findOne({ _id: userID, rfToken: refreshToken }, (err, doc) => {
            console.log(doc)
            if (doc) {
                const newAccessToken = jwt.sign({ userID }, config.secret, { expiresIn: 600 });
                return res.json({
                    accessToken: newAccessToken
                })
            }
            return res.status(401).json({
                message: 'RefreshToken is revoked.'
            })
        })

    } catch (err) {
        console.error(err);
        return res.status(401).json({
            message: 'Invalid accessToken.'
        })
    }
})
module.exports = router;