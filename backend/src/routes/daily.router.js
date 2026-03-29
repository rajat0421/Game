const router = require("express").Router();
const dailyController = require("../controllers/daily.controller");
const { dailyAuthMiddleware } = require("../middlewares/dailyAuthMiddleware");

router.get("/meta", dailyController.meta);
router.get("/leaderboard", dailyController.leaderboard);
router.post("/enter", dailyController.enter);
router.get("/me", dailyAuthMiddleware, dailyController.me);
router.post("/guess", dailyAuthMiddleware, dailyController.guessDaily);
router.post("/logout", dailyController.logoutDaily);

module.exports = router;
