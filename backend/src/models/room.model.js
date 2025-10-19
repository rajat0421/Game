const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    unique: true,
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  secretWord: {
    type: String,
    required: false, // will be added after starting the game
  },
  status: {
    type: String,
    enum: ["waiting", "in-progress", "finished"],
    default: "waiting",
  },
  round: {
    type: Number,
    default: 1,
  },
  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String,
      score: { type: Number, default: 0 },
    },
  ],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  leaderboard: [
    {
      username: String,
      score: Number,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);