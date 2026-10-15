const cors = require("cors");
const express = require("express");
const { clientOrigin } = require("./config/env");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors({ origin: clientOrigin }));
app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
});

module.exports = app;
