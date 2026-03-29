/**
 * Wordle-style evaluation: greens first, then yellows with correct letter counts.
 * All comparisons use lowercase.
 */
function evaluateGuess(secretWord, guess) {
  if (!secretWord || !guess) {
    throw new Error("Both secret word and guess must be provided");
  }

  if (typeof guess !== "string" || typeof secretWord !== "string") {
    throw new Error("Secret word and guess must be strings");
  }

  const secret = secretWord.toLowerCase();
  const g = guess.toLowerCase();

  if (g.length !== secret.length) {
    throw new Error(`Guess must be ${secret.length} letters`);
  }

  const n = secret.length;
  const feedback = Array(n).fill("absent");
  const secretArr = secret.split("");
  const guessArr = g.split("");
  const counts = {};
  for (const c of secretArr) {
    counts[c] = (counts[c] || 0) + 1;
  }

  for (let i = 0; i < n; i++) {
    if (guessArr[i] === secretArr[i]) {
      feedback[i] = "correct";
      counts[guessArr[i]]--;
    }
  }

  for (let i = 0; i < n; i++) {
    if (feedback[i] === "correct") continue;
    const c = guessArr[i];
    if (counts[c] > 0) {
      feedback[i] = "present";
      counts[c]--;
    }
  }

  const correctLetters = [];
  const correctButWrongPlace = [];
  for (let i = 0; i < n; i++) {
    if (feedback[i] === "correct") correctLetters.push(guessArr[i]);
    else if (feedback[i] === "present") correctButWrongPlace.push(guessArr[i]);
  }

  const isCorrect = g === secret;

  return {
    isCorrect,
    feedback,
    correctLetters,
    correctButWrongPlace,
    correctCount: correctLetters.length,
    misplacedCount: correctButWrongPlace.length,
  };
}

module.exports = evaluateGuess;
