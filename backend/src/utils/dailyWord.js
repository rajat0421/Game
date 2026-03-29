const path = require("path");
const crypto = require("crypto");
const { normalizedList } = require(path.join(__dirname, "../../scripts/see.js"));

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

/**
 * Today's global word — always from scripts/see.js MANUAL_WORDS (not random each request).
 */
async function getDailyWordString(dateKey = getUtcDateKey()) {
  const salt = process.env.DAILY_WORD_SALT || process.env.SECRET_KEY || "dev-salt";
  const words = normalizedList();
  if (words.length === 0) {
    throw new Error("No words in scripts/see.js; add MANUAL_WORDS and run npm run seed");
  }
  const index = hashToIndex(dateKey, words.length, salt);
  return words[index];
}

module.exports = { getUtcDateKey, getDailyWordString, hashToIndex };
