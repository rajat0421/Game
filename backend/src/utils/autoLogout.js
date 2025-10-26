const User = require("../models/user.model");

const INACTIVITY_TIMEOUT_MINUTES = 15; // set your timeout here

/**
 * Logs out a user immediately or if they are inactive for too long
 * @param {string} username - the username of the user
 * @param {boolean} checkInactivity - if true, will log out user only if inactive too long
 */
async function logoutUser(username, checkInactivity) {
  try {
    const user = await User.findOne({ username });
    if (!user) return;

    if (checkInactivity) {
      const now = Date.now();
      const lastActive = user.lastActive ? user.lastActive.getTime() : 0;
      const timeout = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

      if (now - lastActive <= timeout) {
        // user is still active, don't log out
        return false; // optional: indicate user is still active
      }
    }

    // log out the user
    user.isLoggedIn = false;
    await user.save();
    console.log(`User ${username} logged out`);
    return true; // optional: indicate user was logged out

  } catch (err) {
    console.error("Error logging out user:", err);
  }
}

module.exports = logoutUser;

