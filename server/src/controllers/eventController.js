const Event = require("../models/Event");
const Booking = require("../models/Booking");

async function getEvents(req, res, next) {
  try {
    const events = await Event.find().sort({ date: 1 }).select("-seats.bookedBy");
    const summaryEvents = events.map((ev) => {
      const total = ev.seats ? ev.seats.length : ev.totalSeats;
      const booked = ev.seats ? ev.seats.filter((s) => s.isBooked).length : 0;
      return {
        _id: ev._id,
        title: ev.title,
        description: ev.description,
        date: ev.date,
        venue: ev.venue,
        seatPrice: ev.seatPrice,
        totalSeats: total,
        bookedCount: booked,
        availableSeats: total - booked,
        createdAt: ev.createdAt,
      };
    });
    return res.json({ events: summaryEvents });
  } catch (error) {
    return next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "EVENT_NOT_FOUND" });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;

    // Mask bookedBy unless it belongs to current user
    const seats = event.seats.map((s) => ({
      _id: s._id,
      seatNumber: s.seatNumber,
      row: s.row,
      number: s.number,
      isBooked: s.isBooked,
      isMine: currentUserId && s.bookedBy && s.bookedBy.toString() === currentUserId,
    }));

    const bookedCount = seats.filter((s) => s.isBooked).length;

    return res.json({
      event: {
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        venue: event.venue,
        seatPrice: event.seatPrice,
        totalSeats: event.totalSeats,
        bookedCount,
        availableSeats: event.totalSeats - bookedCount,
        seats,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function createEvent(req, res, next) {
  try {
    const { title, description, date, venue, totalSeats, seatPrice } = req.body;

    if (!title || !date || !venue || !totalSeats || seatPrice === undefined) {
      return res.status(422).json({ error: "MISSING_REQUIRED_FIELDS" });
    }

    const event = new Event({
      title: title.trim(),
      description: (description || "").trim(),
      date: new Date(date),
      venue: venue.trim(),
      totalSeats: Number(totalSeats),
      seatPrice: Number(seatPrice),
      createdBy: req.user._id,
    });

    await event.save();
    return res.status(201).json({ event });
  } catch (error) {
    return next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, date, venue, seatPrice } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "EVENT_NOT_FOUND" });
    }

    if (title) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (date) event.date = new Date(date);
    if (venue) event.venue = venue.trim();
    if (seatPrice !== undefined) event.seatPrice = Number(seatPrice);

    await event.save();
    return res.json({ event });
  } catch (error) {
    return next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "EVENT_NOT_FOUND" });
    }

    // Check if there are active bookings
    const activeBookings = await Booking.countDocuments({ event: id, status: "confirmed" });
    if (activeBookings > 0) {
      return res.status(400).json({
        error: "EVENT_HAS_ACTIVE_BOOKINGS",
        message: "Cannot delete event with confirmed bookings. Cancel bookings first.",
      });
    }

    await Event.findByIdAndDelete(id);
    return res.json({ message: "Event deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
