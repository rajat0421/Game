const Room = require("../models/room.model");
const Word = require("../models/word.model");
const Guess = require("../models/guess.model");
const evaluateGuess  = require("../utils/evaluateGuess");

async function guess(req,res){
    const  roomCode  = req.params.id;
    const { guess } = req.body || {}; 
    const currentUser = req.user;
  
    try {
      if (!req.body || typeof guess !== "string") {
      return res.status(400).json({
        message: "Invalid request body. Please include a 'guess' field in JSON format.",
        example: { guess: "apple" },
      });
    }

      const room = await Room.findOne({ roomCode });
      if (!room) return res.status(404).json({ message: "Room not found" });
  
      if (room.status !== "in-progress")
        return res.status(400).json({ message: "Game is not in progress" });
  
      const playerIndex = room.players.findIndex(
        (p) => p.username.toString() === currentUser.username.toString()
      );
      if (playerIndex === -1)
        return res.status(403).json({ message: "You are not part of this room" });

  let result;
    try {
      result = evaluateGuess(room.secretWord, guess);
    } catch (err) {
      // Handle length or validation error inside util
      return res.status(400).json({ message: err.message });
    }

    const { isCorrect, correctLetters, correctButWrongPlace, correctCount, misplacedCount } = result;

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
