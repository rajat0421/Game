const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const wordList = require("word-list");
const Word = require("../src/models/word.model");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

async function seedWords() {
  if (!MONGO_URI) {
    console.error("Set MONGO_URI in .env");
    process.exit(1);
  }

  const wordListPath = wordList.path || wordList;
  const raw = fs.readFileSync(wordListPath, "utf8");
  const fiveLetter = raw
    .split("\n")
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length === 5 && /^[a-z]+$/.test(w));

  const unique = [...new Set(fiveLetter)];
  const docs = unique.map((word) => ({ word, category: "general" }));

  try {
    await mongoose.connect(MONGO_URI);
    await Word.deleteMany({});
    await Word.insertMany(docs, { ordered: false });
    console.log(`Seeded ${docs.length} five-letter words`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding words:", err.message);
    process.exit(1);
  }
}

seedWords();
