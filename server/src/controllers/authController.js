const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken } = require("../utils/jwt");

function validCredentials({ name, email, password }, needName) {
  return (!needName || (typeof name === "string" && name.trim().length >= 2)) &&
    typeof email === "string" && /^\S+@\S+\.\S+$/.test(email) &&
    typeof password === "string" && password.length >= 8;
}

function response(user) {
  return { user: user.toJSON(), token: signAccessToken(user) };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!validCredentials({ name, email, password }, true)) return res.status(422).json({ error: "INVALID_REGISTRATION" });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ error: "EMAIL_IN_USE" });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role: "customer" });
    return res.status(201).json(response(user));
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "EMAIL_IN_USE" });
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!validCredentials({ email, password }, false)) return res.status(422).json({ error: "INVALID_CREDENTIALS" });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    return res.json(response(user));
  } catch (error) {
    return next(error);
  }
}

function me(req, res) {
  return res.json({ user: req.user.toJSON() });
}

module.exports = { login, me, register };
