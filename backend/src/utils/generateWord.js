const fs = require("fs");
const wordList = require("word-list"); // Import the module
const wordListPath = wordList.path || wordList; // ✅ handle both cases

const words = fs
  .readFileSync(wordListPath, "utf8")
  .split("\n")
  .filter((w) => w.length === 5 && /^[a-zA-Z]+$/.test(w));

const randomWord = words[Math.floor(Math.random() * words.length)];
console.log(randomWord);
