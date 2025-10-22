const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.router');
const roomRouter = require('./routes/room.router');
const guessRouter = require('./routes/guess.router');
const cors = require('cors');

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));


app.use('/user',userRouter);
app.use('/room',roomRouter);
app.use('/guess',guessRouter);

module.exports = app;