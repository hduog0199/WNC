const quiz = require('../schemas/DB_quiz.js');
const express = require('express');
const router = express.Router();
router.get('/sync/:iduser', (req, res) => {
    quiz.find({ id_user: req.params.iduser }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

router.post('/new', (req, res) => {
    const DB = req.body;
    quiz.create(DB, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})
router.get('/sync/:id', (req, res) => {
    quiz.find({ _id: req.params.id }, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})
router.get('/delete', (req, res) => {
    quiz.remove({}, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send(data)
        }
    })
})

module.exports = router;