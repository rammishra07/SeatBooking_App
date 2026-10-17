const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { authenticate, optionalAuthenticate, requireRole } = require("../middleware/authenticate");

const router = express.Router();

// Public routes
router.get("/", getEvents);
router.get("/:id", optionalAuthenticate, getEventById);

// Admin-only routes
router.post("/", authenticate, requireRole("admin"), createEvent);
router.put("/:id", authenticate, requireRole("admin"), updateEvent);
router.delete("/:id", authenticate, requireRole("admin"), deleteEvent);

module.exports = router;
