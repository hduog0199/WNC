const express = require('express')
const bcrypt = require('bcryptjs')
const config = require('../config.json')
const validate = require('../middlewares/validate.middleware.js')
const User = require('../schemas/DB_user.js');
const rds = require('randomstring')
const router = express.Router();
const schema = {
    type: "object",
    properties: {
        username: { type: "string" },
        password: { type: "string" },
        name: { type: "string" }
    },
    required: ["username", "password", "name"],
    additionalProperties: false
}
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    } else {
        res.render('register')
    }
})

router.post('/', validate(schema), (req, res) => {
        const hashpass = bcrypt.hashSync(req.body.password, 10)
        User.findOne({ username: req.body.username }, (err, doc) => {
            if (doc) {
                res.send("User đã tồn tại")
            } else {
                let newUser = new User({
                    username: req.body.username,
                    password: hashpass,
                    name: req.body.name
                }).save();
                res.status(201).json(req.body);
            }
        })
    })
    // router.post('/create', validate(schema), (req, res) => {
    //         const DB = req.body;
    //         DB.password = bcrypt.hashSync(DB.password, 10)
    //         User.findOne({ username: req.body.username }, (err, doc) => {
    //             if (doc) {
    //                 res.send("Tài khoản đã tồn tại")
    //             } else {
    //                 let newUser = new User({
    //                     username: DB.username,
    //                     password: DB.password,
    //                     name: DB.name
    //                 }).save()
    //                 delete DB.password
    //                 res.status(201).json(DB);
    //                 // User.create(DB, (err, data) => {
    //                 //     console.log(data)
    //                 //     if (err) {
    //                 //         res.status(500).send(err)
    //                 //     } else {
    //                 //         res.status(201).send(data)
    //                 //     }
    //                 // })
    //             }
    //         });

//         // if (user === null) {
//         //     return res.status(401).json({
//         //         authenticated: false
//         //     });
//         // }
//         // if (bcrypt.compareSync(req.body.password, user.password) === false) {
//         //     return res.status(401).json({
//         //         authenticated: false
//         //     });
//         // }

//         // const payload = {
//         //     userID: user._id
//         // };

//         // const opts = {
//         //     expiresIn: 60
//         // }

//         // const accessToken = jwt.sign(payload, config.secret, opts)

//         // const refreshToken = rds.generate(80);
//         // DB.rfToken = refreshToken
//         // res.json({
//         //     authenticated: true,
//         //     accessToken,
//         //     refreshToken
//         // });
//         // User.create(DB, (err, data) => {
//         //     if (err) {
//         //         res.status(500).send(err)
//         //     } else {
//         //         res.status(201).send(data)
//         //     }
//         // })
//     })
//     // router.post('/', validate(schema), async function(req, res) {
//     //     let user = req.body;
//     //     user.password = bcrypt.hashSync(user.password, 10)
//     //     const ret = await userModel.addUser(user)
//     //     user = {
//     //         id: ret[0],
//     //         ...user
//     //     }
//     //     delete user.password
//     //     res.status(201).json(user);
//     // })



// router.patch('/:id', validate(schema), async function(req, res) {
//     const id = req.params.id || 0;
//     const user = req.body;
//     const n = await userModel.patch(id, user);
//     res.json({
//         affected: n
//     });

// })

module.exports = router;