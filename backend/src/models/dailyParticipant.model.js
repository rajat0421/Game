const mongoose = require("mongoose");

const dailyParticipantSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, index: true },
    displayName: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true },
    solved: { type: Boolean, default: false },
    solvedAt: Date,
    guessCount: { type: Number, default: 0 },
    firstGuessAt: Date,
  },
  { timestamps: true }
);

dailyParticipantSchema.index({ dateKey: 1, normalizedName: 1 }, { unique: true });

module.exports = mongoose.model("DailyParticipant", dailyParticipantSchema);
