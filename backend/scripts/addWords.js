const path = require("path");
const mongoose = require("mongoose");
const Word = require("../src/models/word.model");
const { normalizedList } = require("./see.js");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

async function seedWords() {
  if (!MONGO_URI) {
    console.error("Set MONGO_URI in .env");
    process.exit(1);
  }

  const words = normalizedList();
  if (words.length === 0) {
    console.error("No valid 5-letter words in scripts/see.js (MANUAL_WORDS).");
    process.exit(1);
  }

  const docs = words.map((word) => ({ word, category: "general" }));

  try {
    await mongoose.connect(MONGO_URI);
    await Word.deleteMany({});
    await Word.insertMany(docs, { ordered: true });
    console.log(`Seeded ${docs.length} words from scripts/see.js`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding words:", err.message);
    process.exit(1);
  }
}

seedWords();
