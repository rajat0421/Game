/**
 * Your word pool (5 letters, letters only). Edit this list.
 * The global daily word is chosen from here by UTC date + DAILY_WORD_SALT (same for everyone that day).
 * After changing this file, run: npm run seed
 */

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

/**
 * Deduped, lowercased, valid 5-letter words only — order preserved (first occurrence wins).
 */
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

module.exports = { MANUAL_WORDS, normalizedList };
