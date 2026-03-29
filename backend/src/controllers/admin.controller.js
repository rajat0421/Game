const Word = require("../models/word.model");
const DailyWordOverride = require("../models/dailyWordOverride.model");
const { getUtcDateKey, getDailyWordString } = require("../utils/dailyWord");

function validateDateKey(dateKey) {
  return typeof dateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

function validateWord(word) {
  const w = String(word || "")
    .trim()
    .toLowerCase();
  if (w.length !== 5 || !/^[a-z]+$/.test(w)) {
    return { ok: false, error: "word must be exactly 5 letters (a–z)" };
  }
  return { ok: true, word: w };
}

async function ensureWordInPool(w) {
  await Word.updateOne(
    { word: w },
    { $setOnInsert: { word: w, category: "owner" } },
    { upsert: true }
  );
}

/**
 * POST /admin/daily  { word, dateKey? }  — set global word for a UTC day (default today).
 */
async function setDailyWord(req, res) {
  const dateKey =
    req.body?.dateKey != null && req.body.dateKey !== ""
      ? String(req.body.dateKey).trim()
      : getUtcDateKey();

  if (!validateDateKey(dateKey)) {
    return res.status(400).json({ message: "dateKey must be YYYY-MM-DD (UTC)" });
  }

  const check = validateWord(req.body?.word);
  if (!check.ok) {
    return res.status(400).json({ message: check.error });
  }

  try {
    await ensureWordInPool(check.word);
    await DailyWordOverride.findOneAndUpdate(
      { dateKey },
      { $set: { word: check.word } },
      { upsert: true, new: true }
    );
    return res.status(200).json({
      message: "Daily word set",
      dateKey,
      word: check.word,
      source: "override",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message });
  }
}

/**
 * DELETE /admin/daily  body or query { dateKey? } — remove override; that day uses pool hash again.
 */
async function clearDailyWord(req, res) {
  const raw = req.body?.dateKey ?? req.query?.dateKey;
  const dateKey =
    raw != null && String(raw).trim() !== ""
      ? String(raw).trim()
      : getUtcDateKey();

  if (!validateDateKey(dateKey)) {
    return res.status(400).json({ message: "dateKey must be YYYY-MM-DD (UTC)" });
  }

  try {
    const r = await DailyWordOverride.deleteOne({ dateKey });
    return res.status(200).json({
      message:
        r.deletedCount > 0
          ? "Override cleared; this date now uses DB pool + hash"
          : "No override existed for that date",
      dateKey,
      deleted: r.deletedCount,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

/**
 * GET /admin/daily?dateKey= — effective word for that UTC day (override or pool).
 */
async function getDailyWord(req, res) {
  const dateKey = req.query.dateKey
    ? String(req.query.dateKey).trim()
    : getUtcDateKey();

  if (!validateDateKey(dateKey)) {
    return res.status(400).json({ message: "dateKey must be YYYY-MM-DD (UTC)" });
  }

  try {
    const override = await DailyWordOverride.findOne({ dateKey }).lean();
    const word = await getDailyWordString(dateKey);
    return res.status(200).json({
      dateKey,
      word,
      source: override ? "override" : "pool",
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

module.exports = { setDailyWord, clearDailyWord, getDailyWord };
