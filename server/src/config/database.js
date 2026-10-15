const mongoose = require("mongoose");

async function connectDatabase(uri) {
  await mongoose.connect(uri);
}

module.exports = { connectDatabase };
