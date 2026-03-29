const crypto = require("crypto");
const Word = require("../models/word.model");

function getUtcDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/**
 * Deterministic daily index from UTC date + server salt (same word for all players that day).
 */
function hashToIndex(dateKey, count, salt) {
  if (count <= 0) return 0;
  const h = crypto.createHash("sha256").update(`${dateKey}:${salt}`).digest();
  const n = h.readUInt32BE(0);
  return n % count;
}

async function getDailyWordString(dateKey = getUtcDateKey()) {
  const salt = process.env.DAILY_WORD_SALT || process.env.SECRET_KEY || "dev-salt";
  const count = await Word.countDocuments();
  if (count === 0) {
    throw new Error("No words in database; run seed script");
  }
  const index = hashToIndex(dateKey, count, salt);
  const words = await Word.find({}, { word: 1 }).sort({ _id: 1 }).lean();
  return String(words[index].word).toLowerCase();
}

module.exports = { getUtcDateKey, getDailyWordString, hashToIndex };
