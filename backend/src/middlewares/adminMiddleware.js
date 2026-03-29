function adminMiddleware(req, res, next) {
  const key = process.env.OWNER_API_KEY;
  if (!key || String(key).length < 8) {
    return res.status(503).json({
      message: "Owner API is not configured (set OWNER_API_KEY in .env, min 8 chars)",
    });
  }
  const sent = req.headers["x-admin-key"] || req.headers["x-owner-key"];
  if (!sent || sent !== key) {
    return res.status(401).json({ message: "Invalid or missing admin key" });
  }
  next();
}

module.exports = { adminMiddleware };
