const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.router');

app.use(express.json());
app.use(cookieParser());

app.use('/user',userRouter);

module.exports = app;