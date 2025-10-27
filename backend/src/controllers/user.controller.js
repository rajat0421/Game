const user = require('../models/user.model');
const jwt = require("jsonwebtoken");
const logoutUser = require('../utils/autoLogout');

async function register(req, res) {
    
        const {username } = req.body;
        if(!username){
            return res.status(400).send("Username is required");
         }
        const existingUser = await user.findOne({username});
        if(existingUser){
            return res.status(400).send("Username already exists");
        }
 
        const newUser = new user({username});
          newUser.save()
          .then(() => res.status(201).send("User registered successfully"))
          .catch((err) => res.status(400).send("Error: " + err));

        
          

    }

async function login(req, res) {
    const {username } = req.body;
    if(!username){
        return res.status(400).send("Username is required");
     }
    const existingUser = await user.findOne({username});
    if(!existingUser){
        return res.status(400).send("Invalid username");
    }

     // Prevent multiple logins
     if (existingUser.isLoggedIn) {
        return res.status(400).send("User already logged in from another device");
      }

 const userFromDb = await user.findOne({username});
 userFromDb.isLoggedIn = true;
 userFromDb.lastActive = new Date();
 await userFromDb.save();

    const token = jwt.sign({ username },process.env.SECRET_KEY);
    res.cookie("rajat",token);
    return res.status(200).send("Login successful");
}

async function logout(req, res) {
    const token = req.cookies.rajat;

    try {
        if (!token) {
            return res.status(400).send("Pls login");
        }
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        await logoutUser(decoded.username,false);

        res.clearCookie("rajat");
        return res.status(200).send("Logout successful");

    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).send("Something went wrong");
    }
}

async function me(req, res) {
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
        return res.status(200).json({userDetails: existingUser});
    } catch (error) {
        return res.status(401).send("Unauthorized");
    }
}
module.exports = {register , login , me, logout};