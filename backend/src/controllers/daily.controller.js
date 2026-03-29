const jwt = require("jsonwebtoken");
const DailyParticipant = require("../models/dailyParticipant.model");
const evaluateGuess = require("../utils/evaluateGuess");
const { parseFiveLetterGuess } = require("../utils/guessFormat");
const { getUtcDateKey, getDailyWordString } = require("../utils/dailyWord");
const {
  getSessionCookieOptions,
  getClearCookieOptions,
} = require("../utils/cookieOptions");

function normalizeDisplayName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function validateDisplayName(displayName) {
  if (!displayName || typeof displayName !== "string") {
    return "Display name is required";
  }
  const t = displayName.trim();
  if (t.length < 2 || t.length > 24) {
    return "Display name must be 2–24 characters";
  }
  if (!/^[a-zA-Z0-9 _-]+$/.test(t)) {
    return "Use letters, numbers, spaces, hyphen, or underscore only";
  }
  return null;
}

async function meta(req, res) {
  try {
    const dateKey = getUtcDateKey();
    res.json({
      dateKey,
      wordLength: 5,
      mode: "global_daily",
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function enter(req, res) {
  const errMsg = validateDisplayName(req.body?.displayName);
  if (errMsg) {
    return res.status(400).json({ message: errMsg });
  }

  const displayName = req.body.displayName.trim();
  const normalizedName = normalizeDisplayName(displayName);
  const dateKey = getUtcDateKey();

  try {
    const participant = await DailyParticipant.create({
      dateKey,
      displayName,
      normalizedName,
    });

    const token = jwt.sign(
      { typ: "daily", dateKey, sub: participant._id.toString() },
      process.env.SECRET_KEY,
      { expiresIn: "36h" }
    );

    res.cookie("game_daily", token, getSessionCookieOptions(36 * 60 * 60 * 1000));
    return res.status(201).json({
      message: "You're in",
      displayName: participant.displayName,
      dateKey,
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        message: "That name is already taken today (UTC). Try another.",
      });
    }
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
}

async function me(req, res) {
  const p = req.dailyPlayer;
  res.json({
    displayName: p.displayName,
    dateKey: p.dateKey,
    solved: p.solved,
    guessCount: p.guessCount,
    solvedAt: p.solvedAt,
  });
}

async function guessDaily(req, res) {
  const { guess } = req.body || {};
  if (typeof guess !== "string") {
    return res.status(400).json({ message: "Send JSON: { \"guess\": \"abcde\" }" });
  }

  const player = req.dailyPlayer;
  const dateKey = getUtcDateKey();
  if (player.dateKey !== dateKey) {
    return res.status(400).json({ message: "UTC day changed; refresh and join again" });
  }

  if (player.solved) {
    return res.status(200).json({
      message: "You already solved today's word",
      solved: true,
      guessCount: player.guessCount,
      solvedAt: player.solvedAt,
      feedback: null,
    });
  }

  const parsed = parseFiveLetterGuess(guess);
  if (!parsed.ok) {
    return res.status(400).json({ message: parsed.error });
  }

  let secretWord;
  try {
    secretWord = await getDailyWordString(dateKey);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }

  let result;
  try {
    result = evaluateGuess(secretWord, parsed.word);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }

  player.guessCount += 1;
  if (!player.firstGuessAt) player.firstGuessAt = new Date();

  if (result.isCorrect) {
    player.solved = true;
    player.solvedAt = new Date();
  }

  await player.save();

  if (result.isCorrect) {
    return res.status(200).json({
      message: "Correct!",
      solved: true,
      guessCount: player.guessCount,
      feedback: result.feedback,
      isCorrect: true,
    });
  }

  return res.status(200).json({
    message: `${result.correctCount} correct, ${result.misplacedCount} present elsewhere`,
    solved: false,
    guessCount: player.guessCount,
    feedback: result.feedback,
    correctLetters: result.correctLetters,
    correctButWrongPlace: result.correctButWrongPlace,
    isCorrect: false,
  });
}

async function leaderboard(req, res) {
  const dateKey = (req.query.date && String(req.query.date)) || getUtcDateKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return res.status(400).json({ message: "Invalid date; use YYYY-MM-DD (UTC)" });
  }

  try {
    const rows = await DailyParticipant.find({
      dateKey,
      solved: true,
    })
      .sort({ solvedAt: 1, guessCount: 1 })
      .limit(100)
      .select("displayName solvedAt guessCount")
      .lean();

    res.json({ dateKey, leaderboard: rows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

async function logoutDaily(req, res) {
  res.clearCookie("game_daily", getClearCookieOptions());
  res.json({ message: "Logged out of daily mode" });
}

module.exports = {
  meta,
  enter,
  me,
  guessDaily,
  leaderboard,
  logoutDaily,
};
