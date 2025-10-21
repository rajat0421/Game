const user = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function userAuthMiddleware(req, res, next) {
    const token = req.cookies.rajat;
    if(!token){
        return res.status(401).send("Unauthorized");
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const existingUser = await user.findOne({username: decoded.username});
        if(!existingUser){
            return res.status(401).send("Unauthorized");
        }
        req.user = existingUser;
        next();
    } catch (error) {
        return res.status(401).send("Unauthorized" + error.message);
    }
}

module.exports = {
    userAuthMiddleware
};