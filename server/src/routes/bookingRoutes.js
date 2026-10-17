const express = require("express");
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const { authenticate, requireRole } = require("../middleware/authenticate");

const router = express.Router();

// All booking operations require authentication
router.use(authenticate);

// Customer or Admin booking endpoints
router.post("/", createBooking);
router.get("/my", getMyBookings);
router.delete("/:id", cancelBooking);

// Admin-only: list all bookings across all events
router.get("/all", requireRole("admin"), getAllBookings);

module.exports = router;
