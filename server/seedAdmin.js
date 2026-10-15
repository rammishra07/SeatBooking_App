const bcrypt = require("bcryptjs");
const { connectDatabase } = require("./src/config/database");
const { assertRequiredEnv, mongoUri } = require("./src/config/env");
const User = require("./src/models/User");

async function seedAdmin() {
  assertRequiredEnv();
  const { ADMIN_SEED_NAME, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD } = process.env;
  if (!ADMIN_SEED_NAME || !ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) throw new Error("Admin seed environment variables are required");
  await connectDatabase(mongoUri);
  const email = ADMIN_SEED_EMAIL.trim().toLowerCase();
  await User.findOneAndUpdate({ email }, {
    name: ADMIN_SEED_NAME.trim(), email, passwordHash: await bcrypt.hash(ADMIN_SEED_PASSWORD, 12), role: "admin",
  }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log("Admin account seeded");
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
