const mongoose = require("mongoose");
const Word = require("../src/models/word.model");
require("dotenv").config();

const wordsList = [
  { word: "apple", category: "fruits" },
  { word: "grape", category: "fruits" },
  { word: "chair", category: "objects" },
  { word: "table", category: "objects" },
  { word: "phone", category: "electronics" },
  { word: "light", category: "objects" },
];

const MONGO_URI = process.env.MONGO_URI;

async function seedWords() {
  try {
    await mongoose.connect(MONGO_URI);
    await Word.deleteMany({});
    await Word.insertMany(wordsList);
    console.log("Words seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Error seeding words:", err.message);
    process.exit(1);
  }
}

seedWords();
