function evaluateGuess(secretWord, guess) {
     if (!secretWord || !guess) {
    throw new Error("Both secret word and guess must be provided");
  }

  if (typeof guess !== "string" || typeof secretWord !== "string") {
    throw new Error("Secret word and guess must be strings");
  }
  
  if (guess.length !== secretWord.length) {
    throw new Error(`Guess must be ${secretWord.length} letters`);
  }

  const secretLetters = secretWord.split("");
  const guessLetters = guess.split("");
  const correctLetters = [];
  const correctButWrongPlace = [];

  secretLetters.forEach((letter, i) => {
    if (guessLetters[i] === letter) {
      correctLetters.push(letter);
    } else if (secretLetters.includes(guessLetters[i])) {
      correctButWrongPlace.push(guessLetters[i]);
    }
  });

  const isCorrect = guess.toLowerCase() === secretWord.toLowerCase();

  return {
    isCorrect,
    correctLetters,
    correctButWrongPlace,
    correctCount: correctLetters.length,
    misplacedCount: correctButWrongPlace.length,
  };
}

module.exports = evaluateGuess;
