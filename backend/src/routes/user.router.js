const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
require('dotenv').config();


router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me",userController.me);


module.exports = router;