const router = require('express').Router();
const roomController = require('../controllers/room.controller');
const userAuthMiddleware = require('../middlewares/userMiddleware');

router.post("/create", userAuthMiddleware.userAuthMiddleware ,roomController.createRoom);
router.post("/join/:id", userAuthMiddleware.userAuthMiddleware ,roomController.joinRoom);

//for dev only nd non protected
router.get("/getRooms",roomController.getAllRooms);

router.post("/start/:id", userAuthMiddleware.userAuthMiddleware ,roomController.startRoom);
router.get("/leaderboard/:id",roomController.leaderboard);
router.get("/status/:id", userAuthMiddleware.userAuthMiddleware ,roomController.roomStatus);

module.exports = router;