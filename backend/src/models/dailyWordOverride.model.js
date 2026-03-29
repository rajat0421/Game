const mongoose = require("mongoose");

/** Owner-chosen global daily word for a given calendar date (YYYY-MM-DD). */
const dailyWordOverrideSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true, index: true },
    word: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DailyWordOverride", dailyWordOverrideSchema);
