const Room = require("../models/room.model");
const Word = require("../models/word.model");
const Guess = require("../models/guess.model");

async function guess(req,res){
    const  roomCode  = req.params.id;
    const { guess } = req.body; 
    const currentUser = req.user;
  
    try {
      
      const room = await Room.findOne({ roomCode });
      if (!room) return res.status(404).json({ message: "Room not found" });
  
      if (room.status !== "in-progress")
        return res.status(400).json({ message: "Game is not in progress" });
  
      const playerIndex = room.players.findIndex(
        (p) => p.username.toString() === currentUser.username.toString()
      );
      if (playerIndex === -1)
        return res.status(403).json({ message: "You are not part of this room" });

    if (guess.length !== room.secretWord.length)
        return res.status(400).json({ message: `Guess must be ${room.secretWord.length} letters` });
  
        //compare letters for hints
    const secretLetters = room.secretWord.split("");
    const guessLetters = guess.split("");
    let correctLetters = [];
    let correctButWrongPlace = [];

    secretLetters.forEach((letter, i) => {
      if (guessLetters[i] === letter) {
        correctLetters.push(letter);
      } else if (secretLetters.includes(guessLetters[i])) {
        correctButWrongPlace.push(guessLetters[i]);
      }
    });

    const isCorrect = guess.toLowerCase() === room.secretWord.toLowerCase();

    //save guess
    await Guess.create({
      roomCode: room.roomCode,
      player: currentUser._id,
      guess,
      correctLetters,
      correctButWrongPlace,
      isCorrect
    });

    //handle winning
    if (isCorrect && !room.winner) {
      room.winner = currentUser._id;
      room.status = "finished";

      room.players[playerIndex].score = 100;
      await room.save();

      return res.status(200).json({ message: "Correct! You won!", score: 100 });
    }

    return res.status(200).json({
      message: `${correctLetters.length} letters correct and ${correctButWrongPlace.length} correct but misplaced`,
      correctLetters,
      correctButWrongPlace
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
}

module.exports = { guess };
