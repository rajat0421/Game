const mongoose = require("mongoose");

const feedbackEnum = ["correct", "present", "absent"];

const guessEntrySchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    feedback: [{ type: String, enum: feedbackEnum }],
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const dailyParticipantSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, index: true },
    displayName: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true },
    solved: { type: Boolean, default: false },
    solvedAt: Date,
    guessCount: { type: Number, default: 0 },
    firstGuessAt: Date,
    guessHistory: { type: [guessEntrySchema], default: [] },
  },
  { timestamps: true }
);

dailyParticipantSchema.index({ dateKey: 1, normalizedName: 1 }, { unique: true });

module.exports = mongoose.model("DailyParticipant", dailyParticipantSchema);
