import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import SeatMap from "../components/SeatMap";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [successBooking, setSuccessBooking] = useState(null);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getEvent(id);
      setEvent(data.event);
    } catch (err) {
      setError(err.message || "Failed to load event details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleToggleSeat = (seatNumber) => {
    setError("");
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const handleConfirmBooking = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/events/${id}/book` } } });
      return;
    }

    if (selectedSeats.length === 0) {
      setError("Please select at least one seat to proceed.");
      return;
    }

    try {
      setBookingLoading(true);
      setError("");

      const result = await api.createBooking({
        eventId: id,
        seats: selectedSeats,
      });

      setSuccessBooking(result.booking);
      setSelectedSeats([]);
    } catch (err) {
      // Concurrency conflict detection
      if (err.status === 409) {
        setError(
          `Concurrency Conflict: ${err.message || "One or more selected seats were just taken by another user."} Refreshed live availability.`
        );
        fetchEvent(); // reload seat statuses
      } else {
        setError(err.message || "Booking failed. Please try again.");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="center-container">
        <div className="spinner"></div>
        <p>Loading venue and seat matrix...</p>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container" style={{ padding: "40px 20px" }}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/events" className="btn btn-secondary">
          Back to Events
        </Link>
      </div>
    );
  }

  if (successBooking) {
    return (
      <div className="booking-success-container">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2>Reservation Confirmed!</h2>
          <p className="success-subtitle">
            Your seats have been securely reserved via ACID transaction.
          </p>

          <div className="ticket-preview">
            <div className="ticket-header">
              <span className="ticket-ref">REF: {successBooking.bookingReference}</span>
              <span className="ticket-status">{successBooking.status.toUpperCase()}</span>
            </div>
            <div className="ticket-body">
              <h3>{event.title}</h3>
              <p>📍 {event.venue}</p>
              <p>📅 {new Date(event.date).toLocaleString()}</p>
              <div className="ticket-seats">
                <strong>Seats:</strong>
                <div className="seat-tags">
                  {successBooking.seats.map((s) => (
                    <span key={s} className="seat-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ticket-total">
                <span>Total Paid:</span>
                <strong>${successBooking.totalAmount}</strong>
              </div>
            </div>
          </div>

          <div className="success-actions">
            <Link to="/my-bookings" className="btn btn-primary">
              View My Bookings ➔
            </Link>
            <Link to="/events" className="btn btn-outline">
              Explore More Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = selectedSeats.length * event.seatPrice;

  return (
    <div className="booking-page">
      {/* Event Header Banner */}
      <div className="booking-banner">
        <div className="banner-details">
          <Link to="/events" className="back-link">
            ← Back to Events
          </Link>
          <h1>{event.title}</h1>
          <div className="banner-meta">
            <span>📍 {event.venue}</span>
            <span>•</span>
            <span>📅 {new Date(event.date).toLocaleString()}</span>
            <span>•</span>
            <span className="price-highlight">${event.seatPrice} / seat</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger banner-alert">{error}</div>}

      {/* Main Layout: Seat Map on Left, Summary on Right */}
      <div className="booking-layout">
        <div className="seat-map-wrapper">
          <SeatMap
            seats={event.seats}
            selectedSeats={selectedSeats}
            onToggleSeat={handleToggleSeat}
            maxSeats={10}
          />
        </div>

        {/* Sidebar Summary */}
        <aside className="booking-summary-card">
          <h3>Booking Summary</h3>

          <div className="summary-item">
            <span className="summary-label">Event:</span>
            <span className="summary-value truncate">{event.title}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Selected Seats:</span>
            <span className="summary-value">
              {selectedSeats.length === 0 ? (
                <em>None selected</em>
              ) : (
                <div className="selected-tags">
                  {selectedSeats.map((seat) => (
                    <button
                      key={seat}
                      type="button"
                      className="seat-pill"
                      onClick={() => handleToggleSeat(seat)}
                      title="Click to remove"
                    >
                      {seat} ✕
                    </button>
                  ))}
                </div>
              )}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Price per seat:</span>
            <span className="summary-value">${event.seatPrice}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Quantity:</span>
            <span className="summary-value">{selectedSeats.length}</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>Total Amount:</span>
            <span className="total-price">${subtotal}</span>
          </div>

          <div className="booking-actions">
            <button
              type="button"
              disabled={selectedSeats.length === 0 || bookingLoading}
              onClick={handleConfirmBooking}
              className="btn btn-primary btn-block btn-lg"
            >
              {bookingLoading ? (
                "Processing Transaction..."
              ) : user ? (
                `Confirm Reservation ($${subtotal})`
              ) : (
                "Sign In to Complete Booking"
              )}
            </button>
            <p className="guarantee-text">
              🔒 Concurrency safe — seats locked with atomic transaction
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
