const express = require('express');
const mongoose = require('./utils/db.js');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router.js')
const morgan = require('morgan')
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const axios = require('axios');
const app = express();
const quizRouter = require('./routes/quiz.route.js')
const playerRouter = require('./routes/player.route.js')
const authRouter = require('./routes/auth.route.js')
const userRouter = require('./routes/user.route.js')
const quiz = require('./schemas/DB_quiz.js')
const auth = require('./middlewares/auth.middlewares.js')
app.use(router);
const server = http.createServer(app);
const io = socketio(server);
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
const list_Game_Pin = [{ gamePin: 1, id: 1 }]
const list_Player = []
const list_quiz = []
const list_result = [{ gamePin: 1, result: [0, 0, 0, 0] }]
const point = [{ gamePin: 1, point: 1000 }]
const time = [{ gamePin: 1, time: 15 }]
const total_point = 16000
io.on('connection', (socket) => {
    socket.on('join_Room', (gamePin) => {
        console.log(typeof(gamePin))
        socket.join(gamePin);
        io.to(gamePin).emit("dc_chua")
    });
    socket.on('disconnect', () => {
        console.log('User had left!!!');
    });
    socket.on("check_Id", (data, callback) => {
        quiz.countDocuments({ _id: data }, async function(err, count) {
            if (count > 0) {
                callback(true)
            } else {
                callback(false)
            }
        });
    })
    socket.on("check_GamePin", (game_Pin, Game_Pin_exist) => {
        console.log(list_Game_Pin)
        if (list_Game_Pin.some(Game_Pin => Game_Pin.gamePin === Number(game_Pin))) {
            Game_Pin_exist(true)
        } else {
            Game_Pin_exist(false)
        }
    })
    socket.on("end_game", (gamePin) => {
        const push = []
        list_Player.forEach((element, index) => {
            if (element.gamePin === gamePin) {
                const id = list_Player[index].socket_id
                socket.to(id).emit("new_room", gamePin);
                push.push({ name: list_Player[index].Name, score: list_Player[index].score })
            }
        });
        axios.post("http://localhost:4000/player/new", {
            player: push
        })
    })
    socket.on("sort_player", (gamePin) => {
        console.log("truoc khi sap xep", list_Player)
        list_Player.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        const player_sort = []
        list_Player.forEach((element, index) => {
            if (element.gamePin === gamePin) {
                player_sort.push(list_Player[index])
            }
        });
        console.log("xep hang", player_sort)
        socket.emit("sort_player_result", player_sort, gamePin)
        player_sort.forEach((element, index) => {
            if (element.gamePin === gamePin) {
                const id = player_sort[index].socket_id
                socket.to(id).emit("player_position", index);
            }
        });
        console.log("sau khi sap xep", list_Player)
    })
    socket.on("Choose_Answer", (i, data, gamePin, chose_time) => {
        console.log("gamePin", gamePin)
        console.log("chon cau tra loi")
        io.emit("player_answer", data, gamePin)
        const found = list_Player.findIndex(el => el.id === data)
        const point_index = point.findIndex(el => el.gamePin === Number(gamePin))
        list_Player[found].answer = Number(i);
        if (point_index != -1) {
            const t = chose_time - point[point_index].point
            list_Player[found].point = ~~((total_point - t) / 10)
            console.log("diem nguoi choi", list_Player[found])
        }
    })
    socket.on("start_game", (gamePin, start_time) => {
        console.log("chay game")
        console.log("start time:", start_time)
        console.log("game oin start", gamePin)
        io.emit("startGame", gamePin)
        const point_index = point.findIndex(el => el.gamePin === Number(gamePin))
        if (point_index != -1) {
            point[point_index].point = start_time
        }
        const result_index = point.findIndex(el => el.gamePin === gamePin)
        if (result_index != -1) {
            list_result[result_index].result = [0, 0, 0, 0];
        }
    })
    socket.on("Time_up", (q, answer, gamePin) => {
        console.log("loai truyen", typeof(answer))
        io.emit("answer_result", q, gamePin)
        const point_index = point.findIndex(el => el.gamePin === Number(gamePin))
        point[point_index].point = 0
        list_Player.forEach((element, index) => {
            console.log("loai goi", typeof(element.answer))
            if (element.answer === Number(answer) && element.gamePin === gamePin) {
                list_Player[index].score = list_Player[index].score + list_Player[index].point;
                const id = list_Player[index].socket_id
                socket.to(id).emit("get_score", list_Player[index].score, list_Player[index].point);
            } else if (element.gamePin === gamePin && element.answer != Number(answer)) {
                list_Player[index].point = 0;
                const id = list_Player[index].socket_id
                socket.to(id).emit("get_score", list_Player[index].score, list_Player[index].point);
            }
        });
    })
    socket.on("get_data", (gamePin) => {
        const result_index = list_result.findIndex(el => el.gamePin === gamePin)
        if (result_index != -1) {
            list_Player.forEach((element, index) => {
                if (element.gamePin === gamePin && Number(element.answer) === 1) {
                    list_result[result_index].result[0] = list_result[result_index].result[0] + 1
                } else if (element.gamePin === gamePin && Number(element.answer) === 2) {
                    list_result[result_index].result[1] = list_result[result_index].result[1] + 1
                } else if (element.gamePin === gamePin && Number(element.answer) === 3) {
                    list_result[result_index].result[2] = list_result[result_index].result[2] + 1
                } else if (element.gamePin === gamePin && Number(element.answer) === 4) {
                    list_result[result_index].result[3] = list_result[result_index].result[3] + 1
                }
            });
            io.emit("answer_summary", list_result[result_index].result, gamePin);
            console.log("list answer", list_result)
            console.log("result index", result_index)
        }
    })
    socket.on("in danh sach", () => {
        console.log(list_Player)
    })
    socket.on("Player_join", (Name, data, socket_id) => {
        if (list_Game_Pin.some(Game_Pin => Game_Pin.gamePin === Number(data))) {
            list_Player.push({ gamePin: Number(data), id: socket_id, socket_id: '', Name: Name, answer: 0, score: 0, point: 0 })
            io.emit("add_player", Number(data), list_Player)
            console.log("list_player:", list_Player)
        } else {
            console.log("lỗi")
        }
    })
    socket.on("send_id", (data) => {
        const test = list_Player.findIndex(el => el.id === data)
        if (test != -1) {
            list_Player[test].socket_id = socket.id;
            console.log('them id', list_Player)
        }
    })
    socket.on('Host_Join', async(data) => {
        const gamePin = Math.floor(Math.random() * 9000000); //new pin for game
        socket.join(gamePin);
        io.to(gamePin).emit("ok", gamePin, data)
    })
    socket.on('create_Room', function(gamePin) {
        socket.join(gamePin);
        io.to(gamePin).emit("id", gamePin)
        list_Game_Pin.push({ gamePin: gamePin })
        list_result.push({ gamePin: gamePin, result: [0, 0, 0, 0] })
        point.push({ gamePin: gamePin, point: 1000 })
    });

    socket.on("room_quiz", (quiz, gamePin) => {
        list_quiz.push({ gamePin: gamePin, quiz: quiz })
        console.log("list_quiz:", list_quiz)
        console.log(list_quiz[0])
    })
});
const db = mongoose.connection

db.once('open', () => {
    console.log("DB connected");
    console.log("Setting change streams");
    const quizCollection = db.collection("answercontents");
    const changeStream = quizCollection.watch();
    changeStream.on('change', (change) => {
        switch (change.operationType) {
            case "insert":
                const quiz = {
                    quiz: change.fullDocument.quiz,
                };
                io.emit("newquiz", quiz);
                break;
            case "delete":
                io.emit("deletedThought", change.documentKey._id);
                break;
        }
    });
});

app.get('/', (req, res) =>
    res.status(200).send("Home page. Server running okay.")
)

app.use("/quiz", auth, quizRouter)
app.use("/auth", authRouter)
app.use("/player", playerRouter)
app.use("/user", userRouter)
    // app.get('/quiz/sync', (req, res) => {
    //     quiz.find((err, data) => {
    //         if (err) {
    //             res.status(500).send(err)
    //         } else {
    //             res.status(200).send(data)
    //         }
    //     })
    // })

// app.post('/quiz/new', (req, res) => {
//     const DB = req.body;
//     quiz.create(DB, (err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.status(201).send(data)
//         }
//     })
// })
// app.get('/quiz/sync/:id', (req, res) => {
//     quiz.find({ _id: req.params.id }, (err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.status(200).send(data)
//         }
//     })
// })

// app.get('/player/sync', (req, res) => {
//     Player.find((err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.status(200).send(data)
//         }
//     })
// })

// app.get('/player/sync/:id', (req, res) => {
//     Player.find({ _id: req.params.id }, (err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.status(200).send(data)
//         }
//     })
// })

// app.post('/player/new', (req, res) => {
//     const DB = req.body;
//     Player.create(DB, (err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.status(201).send(data)
//         }
//     })
// })
// app.get('/player/delete', (req, res) => {
//     Player.remove({}, (err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.send(data)
//         }
//     })
// })
// app.get('/quiz/delete', (req, res) => {
//     quiz.remove({}, (err, data) => {
//         if (err) {
//             res.status(500).send(err)
//         } else {
//             res.send(data)
//         }
//     })
// })
// app.put('/player/:id', async(req, res) => {
//     const DB = req.body;
//     try {
//         let result = await Player.findByIdAndUpdate(
//             req.params.id, {
//                 $push: { "player": DB }
//             },
//         );
//         if (!result) return res.status(404);
//         res.send(result)
//     } catch (err) {
//         console.log(err);
//         res.status(500).send(err)
//     }
// })
// app.put('/player/:id/:playerid', async(req, res) => {
//     const DB = req.body;
//     try {
//         let result = await Player.findByIdAndUpdate(
//             req.params.id, {
//                 $inc: {
//                     "Player.$[inner].score": DB
//                 }
//             },
//         );
//         if (!result) return res.status(404);
//         res.send(result)
//     } catch (err) {
//         console.log(err);
//         res.status(500).send(err)
//     }
// })
server.listen(PORT, () => console.log(`server on ${PORT}`))