/**
 * Bootstrap the first admin or promote an existing user to admin.
 * Run: npm run seed:admin
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) {
    console.error('Set SEED_ADMIN_EMAIL in .env');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('Set MONGO_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    // UPDATED: Force the existing account to be verified
    await User.updateOne({ _id: existing._id }, { $set: { role: 'admin', isVerified: true } });
    console.log(`✅ Updated and verified admin: ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = (process.env.SEED_ADMIN_NAME || 'Admin').trim();
  if (!password) {
    console.error(
      'No user with that email. Set SEED_ADMIN_PASSWORD (and optionally SEED_ADMIN_NAME) to create a new admin.'
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  // UPDATED: Force the new account to be verified upon creation
  await User.create({ name, email, password, role: 'admin', isVerified: true });
  console.log(`✅ Created and verified admin: ${email}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});