const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    default: "general", // e.g., fruits, objects, etc.
  },
});

module.exports = mongoose.model("Word", wordSchema);
