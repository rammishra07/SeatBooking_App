const jwt = require("jsonwebtoken");
const { jwtExpiresIn, jwtSecret } = require("../config/env");

function signAccessToken(user) {
  return jwt.sign({ role: user.role }, jwtSecret, {
    subject: user._id.toString(),
    expiresIn: jwtExpiresIn,
  });
}

module.exports = { signAccessToken };
