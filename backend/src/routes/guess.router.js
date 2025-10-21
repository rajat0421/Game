const router = require("express").Router();
const guessController = require("../controllers/guess.controller");
const userAuthMiddleware = require("../middlewares/userMiddleware");

router.post("/:id", userAuthMiddleware.userAuthMiddleware, guessController.guess);

module.exports = router;