const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // fallback to system dns
}

const mongoose = require("mongoose");

async function connectDatabase(uri) {
  await mongoose.connect(uri);
}

module.exports = { connectDatabase };
