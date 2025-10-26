const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
require('dotenv').config();
const userMiddleware = require('../middlewares/userMiddleware');


router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me",userController.me);
router.get("/logout",userController.logout);


module.exports = router;