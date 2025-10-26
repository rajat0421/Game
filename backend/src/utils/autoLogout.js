const User = require("../models/user.model");

function startAutoLogoutJob(timeoutMinutes = 15) {
  const timeout = timeoutMinutes * 60 * 1000;

  setInterval(async () => {
    const now = Date.now();
    try {
      const result = await User.updateMany(
        { isLoggedIn: true, lastActive: { $lt: new Date(now - timeout) } },
        { isLoggedIn: false }
      );
      if (result.modifiedCount > 0) {
        console.log(`Auto-logged out ${result.modifiedCount} inactive user(s)`);
      }
    } catch (err) {
      console.error("Error in auto-logout job:", err);
    }
  }, 60 * 1000); 
}

module.exports = startAutoLogoutJob;
