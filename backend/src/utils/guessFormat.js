/**
 * Any 5-letter a–z guess is accepted (no dictionary check).
 */
function parseFiveLetterGuess(guess) {
  if (typeof guess !== "string") {
    return { ok: false, error: "Guess must be a string" };
  }
  const w = guess.trim().toLowerCase();
  if (w.length !== 5) {
    return { ok: false, error: "Guess must be exactly 5 letters" };
  }
  if (!/^[a-z]{5}$/.test(w)) {
    return { ok: false, error: "Only letters A–Z allowed" };
  }
  return { ok: true, word: w };
}

module.exports = { parseFiveLetterGuess };
