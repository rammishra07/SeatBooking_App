const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { jwtSecret } = require("../config/env");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "AUTH_REQUIRED" });

  try {
    const payload = jwt.verify(header.slice(7), jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: "AUTH_INVALID" });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "AUTH_INVALID" });
  }
}

async function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  try {
    const payload = jwt.verify(header.slice(7), jwtSecret);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch {
    // Ignore invalid token for optional auth
  }
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "FORBIDDEN" });
    return next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };
