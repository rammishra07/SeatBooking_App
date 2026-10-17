const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const eventRoutes = require("./src/routes/eventRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");

connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    app: "SeatBooking API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Centralized error handling
app.use((error, _req, res, _next) => {
  console.error("Server Error:", error);
  const status = error.status || error.statusCode || 500;
  res.status(status).json({
    error: error.code || "INTERNAL_SERVER_ERROR",
    message: error.message || "An unexpected error occurred",
  });
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`🚀 SeatBooking API listening on port ${port}`);
});

module.exports = app;
