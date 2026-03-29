const crypto = require("crypto");
const Word = require("../models/word.model");
const DailyWordOverride = require("../models/dailyWordOverride.model");

function getUtcDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function hashToIndex(dateKey, count, salt) {
  if (count <= 0) return 0;
  const h = crypto.createHash("sha256").update(`${dateKey}:${salt}`).digest();
  const n = h.readUInt32BE(0);
  return n % count;
}

/**
 * Global daily word: owner override in DB if set, else deterministic pick from Word collection.
 */
async function getDailyWordString(dateKey = getUtcDateKey()) {
  const override = await DailyWordOverride.findOne({ dateKey }).lean();
  if (override?.word) {
    return String(override.word).toLowerCase();
  }

  const salt = process.env.DAILY_WORD_SALT || process.env.SECRET_KEY || "dev-salt";
  const count = await Word.countDocuments();
  if (count === 0) {
    throw new Error("No words in database; run: npm run seed");
  }
  const index = hashToIndex(dateKey, count, salt);
  const words = await Word.find({}, { word: 1 }).sort({ word: 1 }).lean();
  return String(words[index].word).toLowerCase();
}

module.exports = { getUtcDateKey, getDailyWordString, hashToIndex };
