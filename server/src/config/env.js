require("dotenv").config();

const required = ["MONGODB_URI", "JWT_SECRET"];

function assertRequiredEnv() {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
}

module.exports = {
  assertRequiredEnv,
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
