import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../auth/AuthContext";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { isAdmin } = useAuth();

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await api.getEvents();
        setEvents(data.events || []);
      } catch (err) {
        setError(err.message || "Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    const term = searchTerm.toLowerCase();
    return (
      ev.title.toLowerCase().includes(term) ||
      ev.venue.toLowerCase().includes(term) ||
      (ev.description && ev.description.toLowerCase().includes(term))
    );
  });

  const formatDate = (dateString) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="events-page">
      <div className="page-header">
        <div className="header-titles">
          <h1>Upcoming Events</h1>
          <p>Select an event to view real-time stage availability and reserve your seats</p>
        </div>

        <div className="header-actions">
          <input
            type="text"
            placeholder="Search by title or venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {isAdmin && (
            <Link to="/admin" className="btn btn-primary">
              + Create Event
            </Link>
          )}
        </div>
      </div>

      {loading && (
        <div className="center-container">
          <div className="spinner"></div>
          <p>Loading upcoming events...</p>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filteredEvents.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h3>No events found</h3>
          <p>
            {searchTerm
              ? `No events matching "${searchTerm}". Try another search.`
              : "No upcoming events scheduled yet."}
          </p>
          {isAdmin && (
            <Link to="/admin" className="btn btn-primary">
              Create Your First Event
            </Link>
          )}
        </div>
      )}

      <div className="events-grid">
        {filteredEvents.map((event) => {
          const bookedPct = Math.round((event.bookedCount / event.totalSeats) * 100) || 0;
          const isSoldOut = event.availableSeats === 0;

          return (
            <div key={event._id} className="event-card">
              <div className="event-card-body">
                <div className="event-badge-row">
                  <span className="event-price-tag">${event.seatPrice} / seat</span>
                  {isSoldOut ? (
                    <span className="status-badge sold-out">Sold Out</span>
                  ) : (
                    <span className="status-badge available">{event.availableSeats} Seats Left</span>
                  )}
                </div>

                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">{event.description || "No description provided."}</p>

                <div className="event-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <span>{event.venue}</span>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="occupancy-section">
                  <div className="occupancy-labels">
                    <span>Occupancy</span>
                    <span>{bookedPct}% booked</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${bookedPct}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="event-card-footer">
                <Link
                  to={`/events/${event._id}/book`}
                  className={`btn btn-block ${isSoldOut ? "btn-disabled" : "btn-primary"}`}
                >
                  {isSoldOut ? "Fully Booked" : "Select Seats ➔"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
