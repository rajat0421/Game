const room = require('../models/room.model');
const generateRoomCode = require('../utils/generateRoomCode');

async function createRoom(req, res) {
    try {
    
    const { roomName } = req.body;
    if (!roomName) {
        return res.status(400).send("Room name is required");
    }
    const roomAlreadyExists = await room.findOne({roomName});
    if (roomAlreadyExists){
        return res.status(400).json({message: "Room name already exists"});
    }
        const { userId, username } = req.user;

    let roomCode;
    let isUnique = false;

    while (!isUnique) {
      roomCode = generateRoomCode();
      const existingRoom = await room.findOne({ roomCode });
      if (!existingRoom) isUnique = true;
    }

    const newRoom = new room({
        roomCode,
        roomName,
        players: [{ userId, username }],
        status: "waiting",
        createdBy : username
    })
    await newRoom.save();
    return res.status(201).json({ roomCode: newRoom.roomCode, createdBy: req.user.username });
}catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ message: "Server error" });
}

}

async function joinRoom(req,res){

    const roomCode = req.params.id;
    const userName = req.user.username;
    try{
        const existingRoom = await room.findOne({roomCode});
        if (existingRoom.status !== "waiting") {
            return res.status(400).json({ message: "Game already started!" });
          }
        if(!existingRoom){
            return res.status(404).json({message: "Room not found"});
        }
        const playerExists = existingRoom.players.some(player => player.username === userName);
        if(playerExists){
            return res.status(400).json({message: "User already in the room"});
        }
        existingRoom.players.push({username: userName, userId: req.user.userId, score : 0});
        await existingRoom.save();
        const players = existingRoom.players.map((p) => p.username);

        return res.status(200).json({
            message: "Joined successfully",
            roomName: existingRoom.roomName,
            players,
          });    }catch(error){
        return res.status(500).json({message: "Server error" + error.message});
    }
}

async function getAllRooms(req, res) {
    try {
        const rooms = await room.find({});
        return res.status(200).json(rooms);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

async function startRoom (req, res)
{
    const roomCode = req.params.id;
    const currentUser = req.user;
    try{
        const existingRoom = await room.findOne({roomCode});
        if(!existingRoom){
            return res.status(404).json({message: "Room not found"});
        }
        if (existingRoom.host.username !== currentUser.username)
            return res.status(403).json({ message: "Only the host can start the game" });

        //code for fetching the word from db
        const count = await Word.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const randomWordDoc = await Word.findOne().skip(randomIndex);
    const randomWord = randomWordDoc.word;

        existingRoom.secretWord = randomWord;
        if(existingRoom.status == "waiting"){
        existingRoom.status = "in-progress";
        await existingRoom.save();
        return res.status(200).json({message: "Game started"  , secretWordLength: randomWord.length,} );
        }
    }catch(error){
        return res.status(500).json({message: "Server error" + error.message});
    }
}

module.exports = { createRoom , joinRoom , getAllRooms , startRoom};