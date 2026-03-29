const jwt = require("jsonwebtoken");
const DailyParticipant = require("../models/dailyParticipant.model");
const { getUtcDateKey } = require("../utils/dailyWord");

async function dailyAuthMiddleware(req, res, next) {
  const token = req.cookies.game_daily;
  if (!token) {
    return res.status(401).json({ message: "Enter a display name for today's game first" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (decoded.typ !== "daily" || !decoded.dateKey || !decoded.sub) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const today = getUtcDateKey();
    if (decoded.dateKey !== today) {
      return res.status(401).json({
        message: "New UTC day — pick your name again for today's puzzle",
        dateKey: today,
      });
    }

    const participant = await DailyParticipant.findById(decoded.sub);
    if (!participant || participant.dateKey !== today) {
      return res.status(401).json({ message: "Session invalid" });
    }

    req.dailyPlayer = participant;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { dailyAuthMiddleware };
