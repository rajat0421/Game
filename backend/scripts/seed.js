/**
 * Your word pool (5 letters, letters only). Edit MANUAL_WORDS, then run:
 *   npm run seed
 * Words are written to MongoDB; the live server picks the global daily word from the DB
 * (hash by UTC date + salt), unless you set an owner override via /admin API.
 */

const path = require("path");
const mongoose = require("mongoose");
const Word = require("../src/models/word.model");
const DailyWordOverride = require("../src/models/dailyWordOverride.model");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const MANUAL_WORDS = [
  "apple",
  "beach",
  "chair",
  "dance",
  "eagle",
  "flame",
  "grape",
  "house",
  "image",
  "jelly",
  "knife",
  "lemon",
  "music",
  "night",
  "ocean",
  "piano",
  "queen",
  "river",
  "smile",
  "table",
];

function normalizedList() {
  const seen = new Set();
  const out = [];
  for (const w of MANUAL_WORDS) {
    const x = String(w).trim().toLowerCase();
    if (x.length !== 5 || !/^[a-z]+$/.test(x)) continue;
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

async function runSeed() {
  const MONGO_URI =
    process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!MONGO_URI) {
    console.error("Set MONGO_URI in .env");
    process.exit(1);
  }

  const fromFile = normalizedList();
  if (fromFile.length === 0) {
    console.error("No valid 5-letter words in scripts/seed.js (MANUAL_WORDS).");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);

    const overrides = await DailyWordOverride.find({}, { word: 1 }).lean();
    const extra = overrides
      .map((o) => String(o.word || "").toLowerCase().trim())
      .filter((w) => w.length === 5 && /^[a-z]+$/.test(w));

    const merged = [...new Set([...fromFile, ...extra])].sort();

    const docs = merged.map((word) => ({
      word,
      category: "general",
    }));

    await Word.deleteMany({});
    await Word.insertMany(docs, { ordered: true });
    console.log(
      `Seeded ${docs.length} words into MongoDB (${fromFile.length} from MANUAL_WORDS + owner overrides)`
    );
    process.exit(0);
  } catch (err) {
    console.error("Error seeding words:", err.message);
    process.exit(1);
  }
}

module.exports = { MANUAL_WORDS, normalizedList };

if (require.main === module) {
  runSeed();
}
