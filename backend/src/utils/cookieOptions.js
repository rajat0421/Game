/**
 * Cross-site cookies (Vercel → Render) need SameSite=None and Secure in production.
 */
function getSessionCookieOptions(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    maxAge: maxAgeMs,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
}

/** Match options when clearing so the browser removes the cookie. */
function getClearCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    path: "/",
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  };
}

module.exports = { getSessionCookieOptions, getClearCookieOptions };
