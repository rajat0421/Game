const mongoose = require("mongoose");

const guessSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  guess: {
    type: String,
    required: true,
    trim: true,
  },
  correctLetters: {
    type: [String],
    default: [],
  },
  correctButWrongPlace: {
    type: [String],
    default: [],
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  timeTaken: {
    type: Number,
    default: 0, // time taken to make the guess
  },
}, { timestamps: true });

module.exports = mongoose.model("Guess", guessSchema);
