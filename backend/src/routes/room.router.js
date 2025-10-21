const router = require('express').Router();
const roomController = require('../controllers/room.controller');

app.post("/create", roomController.createRoom);

module.exports = router;