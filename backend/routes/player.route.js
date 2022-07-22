const Player = require('../schemas/DB_player.js');
const express = require('express');
const router = express.Router();
router.get('/sync', (req, res) => {
    Player.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

router.get('/sync/:id', (req, res) => {
    Player.find({ _id: req.params.id }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

router.post('/new', (req, res) => {
    const DB = req.body;
    Player.create(DB, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})
router.get('/delete', (req, res) => {
    Player.remove({}, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(data)
        }
    })
})
router.put('/:id', async(req, res) => {
    const DB = req.body;
    try {
        let result = await Player.findByIdAndUpdate(
            req.params.id, {
                $push: { "player": DB }
            },
        );
        if (!result) return res.status(404);
        res.send(result)
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
})
router.put('/:id/:playerid', async(req, res) => {
    const DB = req.body;
    try {
        let result = await Player.findByIdAndUpdate(
            req.params.id, {
                $inc: {
                    "Player.$[inner].score": DB
                }
            },
        );
        if (!result) return res.status(404);
        res.send(result)
    } catch (err) {
        console.log(err);
        res.status(500).send(err)
    }
})
module.exports = router;