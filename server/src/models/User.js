const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["customer", "admin"], default: "customer", required: true },
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.set("toJSON", { transform: (_document, returned) => {
  delete returned.passwordHash;
  delete returned.__v;
  return returned;
} });

module.exports = mongoose.model("User", userSchema);
