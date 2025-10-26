const user = require('../models/user.model');
const jwt = require("jsonwebtoken");

async function register(req, res) {
    
        const {username } = req.body;
        if(!username){
            return res.status(400).send("Username and password are required");
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
    const token = jwt.sign({ username },process.env.SECRET_KEY);
    res.cookie("rajat",token);
    return res.status(200).send("Login successful");
}

async function logout (req,res){
    res.clearCookie("rajat");
    return res.status(200).send("Logout successful");
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
        return res.status(200).json({username: existingUser.username});
    } catch (error) {
        return res.status(401).send("Unauthorized");
    }
}
module.exports = {register , login , me, logout};