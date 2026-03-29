const Room = require("../models/room.model");
const Word = require("../models/word.model");
const Guess = require("../models/guess.model");
const evaluateGuess = require("../utils/evaluateGuess");

async function isWordAllowed(guess) {
  const w = guess.toLowerCase().trim();
  if (!/^[a-z]{5}$/.test(w)) return false;
  return !!(await Word.exists({ word: w }));
}

async function guess(req, res) {
  const roomCode = req.params.id;
  const { guess: guessWord } = req.body || {};
  const currentUser = req.user;

  try {
    if (!req.body || typeof guessWord !== "string") {
      return res.status(400).json({
        message: "Invalid request body. Please include a 'guess' field in JSON format.",
        example: { guess: "apple" },
      });
    }

    const allowed = await isWordAllowed(guessWord);
    if (!allowed) {
      return res.status(400).json({ message: "Not in the 5-letter word list" });
    }

    const roomDoc = await Room.findOne({ roomCode });
    if (!roomDoc) return res.status(404).json({ message: "Room not found" });

    if (roomDoc.status !== "in-progress") {
      return res.status(400).json({ message: "Game is not in progress" });
    }

    const playerIndex = roomDoc.players.findIndex(
      (p) => p.username === currentUser.username
    );
    if (playerIndex === -1) {
      return res.status(403).json({ message: "You are not part of this room" });
    }

    let result;
    try {
      result = evaluateGuess(roomDoc.secretWord, guessWord);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const {
      isCorrect,
      correctLetters,
      correctButWrongPlace,
      correctCount,
      misplacedCount,
      feedback,
    } = result;

    await Guess.create({
      roomCode: roomDoc.roomCode,
      player: currentUser._id,
      guess: guessWord,
      correctLetters,
      correctButWrongPlace,
      isCorrect,
    });

    if (isCorrect && !roomDoc.winner) {
      roomDoc.winner = currentUser._id;
      roomDoc.status = "finished";
      roomDoc.players[playerIndex].score = 100;
      await roomDoc.save();

      return res.status(200).json({
        message: "Correct! You won!",
        score: 100,
        feedback,
        isCorrect: true,
      });
    }

    return res.status(200).json({
      message: `${correctCount} letters correct and ${misplacedCount} correct but misplaced`,
      correctLetters,
      correctButWrongPlace,
      feedback,
      isCorrect: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error: " + err.message });
  }
}

module.exports = { guess };
