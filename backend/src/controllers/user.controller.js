const user = require('../models/user.model');
const jwt = require("jsonwebtoken");

async function register(req, res) {
    
        const {username , password} = req.body;
        if(!username || !password){
            return res.status(400).send("Username and password are required");
         }
        const existingUser = await user.findOne({username});
        if(existingUser){
            return res.status(400).send("Username already exists");
        }
 
        const newUser = new user({username, password});
          newUser.save()
          .then(() => res.status(201).send("User registered successfully"))
          .catch((err) => res.status(400).send("Error: " + err));

        
          

    }

async function login(req, res) {
    const {username , password} = req.body;
    if(!username || !password){
        return res.status(400).send("Username and password are required");
     }
    const existingUser = await user.findOne({username});
    if(!existingUser){
        return res.status(400).send("Invalid username or password");
    }
    if(existingUser.password !== password){
        return res.status(400).send("Invalid username or password");
    }
    const token = jwt.sign({ username },process.env.SECRET_KEY);
    res.cookie("rajat",token);
    return res.status(200).send("Login successful");
}


async function me(req, res) {
    const username = req.body
}
module.exports = {register , login , me};