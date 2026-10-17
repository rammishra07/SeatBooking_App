import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || "Failed to load your reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? The seats will be released immediately.")) {
      return;
    }

    try {
      setActionLoading(bookingId);
      await api.cancelBooking(bookingId);
      // Refresh list
      await fetchBookings();
    } catch (err) {
      alert(err.message || "Failed to cancel booking.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>My Reservations</h1>
          <p>View your booked tickets, seat allocations, and manage cancellations</p>
        </div>
        <Link to="/events" className="btn btn-primary">
          + Book More Seats
        </Link>
      </div>

      {loading && (
        <div className="center-container">
          <div className="spinner"></div>
          <p>Fetching your reservations...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h3>No bookings yet</h3>
          <p>You haven't reserved any tickets yet. Explore our events and pick your favorite seats!</p>
          <Link to="/events" className="btn btn-primary">
            Browse Upcoming Events
          </Link>
        </div>
      )}

      <div className="bookings-list">
        {bookings.map((booking) => {
          const isCancelled = booking.status === "cancelled";
          const event = booking.event || {};

          return (
            <div key={booking._id} className={`booking-card ${isCancelled ? "cancelled-card" : ""}`}>
              <div className="booking-card-header">
                <div className="ref-group">
                  <span className="ref-label">Reference</span>
                  <span className="ref-number">{booking.bookingReference}</span>
                </div>
                <span className={`status-pill ${booking.status}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>

              <div className="booking-card-body">
                <div className="booking-event-info">
                  <h3>{event.title || "Event details unavailable"}</h3>
                  <p>📍 {event.venue || "Venue"}</p>
                  <p>📅 {event.date ? new Date(event.date).toLocaleString() : "Date"}</p>
                </div>

                <div className="booking-details-grid">
                  <div className="detail-col">
                    <span className="col-label">Seats Reserved:</span>
                    <div className="seat-badge-list">
                      {booking.seats.map((seat) => (
                        <span key={seat} className="seat-badge">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-col">
                    <span className="col-label">Total Amount:</span>
                    <span className="total-highlight">${booking.totalAmount}</span>
                  </div>

                  <div className="detail-col">
                    <span className="col-label">Booked On:</span>
                    <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="booking-card-footer">
                {!isCancelled ? (
                  <button
                    type="button"
                    disabled={actionLoading === booking._id}
                    onClick={() => handleCancel(booking._id)}
                    className="btn btn-danger-outline btn-sm"
                  >
                    {actionLoading === booking._id ? "Cancelling..." : "Cancel Reservation"}
                  </button>
                ) : (
                  <span className="cancelled-note">Reservation was cancelled & seats released.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
