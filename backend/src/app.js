const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.router');
const roomRouter = require('./routes/room.router');

app.use(express.json());
app.use(cookieParser());

app.use('/user',userRouter);
app.use('/room',roomRouter);

module.exports = app;