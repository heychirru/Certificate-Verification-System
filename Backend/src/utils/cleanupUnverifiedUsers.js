const cron = require('node-cron');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete unverified users whose verification tokens have expired
// @return  {Promise<void>}
// ─────────────────────────────────────────────────────────────────────────────
const cleanupExpiredVerificationTokens = async () => {
  try {
    const now = new Date();

    // Find and delete unverified users whose token has expired
    const result = await User.deleteMany({
      isVerified: false,
      verificationTokenExpiry: { $lt: now }, // Token expiry is in the past
    });

    if (result.deletedCount > 0) {
      console.log(
        `🗑️  Cleanup: Deleted ${result.deletedCount} unverified user(s) with expired tokens`
      );
    }
  } catch (error) {
    console.error('❌ Cleanup job failed:', error.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Schedule cleanup job to run every hour
// @return  {ScheduledTask} Cron job instance
// ─────────────────────────────────────────────────────────────────────────────
const scheduleCleanupJob = () => {
  try {
    // Run cleanup task every hour at the top of the hour
    const task = cron.schedule('0 * * * *', cleanupExpiredVerificationTokens);
    return task;
  } catch (error) {
    console.error('❌ Failed to schedule cleanup job:', error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Run cleanup immediately (useful on startup to clean old data)
// @return  {Promise<void>}
// ─────────────────────────────────────────────────────────────────────────────
const runCleanupNow = async () => {
  await cleanupExpiredVerificationTokens();
};

module.exports = {
  scheduleCleanupJob,
  runCleanupNow,
  cleanupExpiredVerificationTokens,
};
