const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

function generateBookingReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "BK-";
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

/**
 * Concurrency-safe, transactional seat booking
 */
async function createBooking(req, res, next) {
  const { eventId, seats } = req.body;

  if (!eventId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(422).json({ error: "INVALID_BOOKING_PAYLOAD" });
  }

  // Maximum 10 seats per single booking for fairness
  if (seats.length > 10) {
    return res.status(400).json({
      error: "SEAT_LIMIT_EXCEEDED",
      message: "You can book at most 10 seats per transaction.",
    });
  }

  // Ensure unique seat numbers in the request
  const uniqueSeats = [...new Set(seats.map((s) => String(s).trim().toUpperCase()))];
  if (uniqueSeats.length !== seats.length) {
    return res.status(400).json({ error: "DUPLICATE_SEATS_REQUESTED" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Fetch event within session
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ error: "EVENT_NOT_FOUND" });
    }

    if (new Date(event.date) < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ error: "EVENT_EXPIRED", message: "Cannot book past events." });
    }

    // 2. Concurrency check: verify every requested seat exists and is currently unbooked
    const seatMap = new Map(event.seats.map((s) => [s.seatNumber, s]));

    for (const seatNum of uniqueSeats) {
      const seat = seatMap.get(seatNum);
      if (!seat) {
        await session.abortTransaction();
        return res.status(404).json({
          error: "SEAT_NOT_FOUND",
          message: `Seat ${seatNum} does not exist for this event.`,
        });
      }
      if (seat.isBooked) {
        await session.abortTransaction();
        return res.status(409).json({
          error: "SEAT_ALREADY_BOOKED",
          message: `Seat ${seatNum} is already booked. Please choose another seat.`,
        });
      }
    }

    // 3. Mark requested seats as booked in the event document
    const now = new Date();
    event.seats.forEach((s) => {
      if (uniqueSeats.includes(s.seatNumber)) {
        s.isBooked = true;
        s.bookedBy = req.user._id;
        s.bookedAt = now;
      }
    });

    await event.save({ session });

    // 4. Calculate total and create booking record
    const totalAmount = uniqueSeats.length * event.seatPrice;
    const bookingRef = generateBookingReference();

    const [booking] = await Booking.create(
      [
        {
          event: event._id,
          user: req.user._id,
          seats: uniqueSeats,
          totalAmount,
          status: "confirmed",
          bookingReference: bookingRef,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      message: "Booking confirmed successfully",
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        seats: booking.seats,
        totalAmount: booking.totalAmount,
        status: booking.status,
        createdAt: booking.createdAt,
        event: {
          _id: event._id,
          title: event.title,
          date: event.date,
          venue: event.venue,
        },
      },
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // ignore abort errors
      }
    }
    return next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("event", "title date venue seatPrice")
      .sort({ createdAt: -1 });

    return res.json({ bookings });
  } catch (error) {
    return next(error);
  }
}

async function getAllBookings(_req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate("event", "title date venue")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({ bookings });
  } catch (error) {
    return next(error);
  }
}

async function cancelBooking(req, res, next) {
  const { id } = req.params;
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ error: "BOOKING_NOT_FOUND" });
    }

    // Role check: Only the booking owner or admin can cancel
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({ error: "FORBIDDEN" });
    }

    if (booking.status === "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({ error: "ALREADY_CANCELLED" });
    }

    // Release seats in Event
    const event = await Event.findById(booking.event).session(session);
    if (event) {
      event.seats.forEach((s) => {
        if (booking.seats.includes(s.seatNumber)) {
          s.isBooked = false;
          s.bookedBy = null;
          s.bookedAt = null;
        }
      });
      await event.save({ session });
    }

    booking.status = "cancelled";
    await booking.save({ session });

    await session.commitTransaction();

    return res.json({
      message: "Booking cancelled successfully and seats released.",
      booking,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (e) {}
    }
    return next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
};
