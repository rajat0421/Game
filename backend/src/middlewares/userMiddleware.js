const user = require('../models/user.model');
const jwt = require('jsonwebtoken');
const logoutUser = require('../utils/autoLogout');

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

         // --- Call logout utility for inactivity check ---
         const wasLoggedOut = await logoutUser(existingUser.username, true);
         if (wasLoggedOut) {
             return res.status(401).send("Session expired due to inactivity");
         }
 
         // Update lastActive timestamp for this request
         existingUser.lastActive = new Date();
         await existingUser.save();

        req.user = existingUser;
        next();
    } catch (error) {
        return res.status(401).send("Unauthorized " +  error);
    }
}

module.exports = {
    userAuthMiddleware
};