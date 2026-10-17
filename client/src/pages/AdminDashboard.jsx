import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // New Event Form State
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    totalSeats: 40,
    seatPrice: 50,
  });
  const [creating, setCreating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [eventsRes, bookingsRes] = await Promise.all([
        api.getEvents(),
        api.getAllBookings().catch(() => ({ bookings: [] })),
      ]);
      setEvents(eventsRes.events || []);
      setAllBookings(bookingsRes.bookings || []);
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setCreating(true);

    try {
      await api.createEvent(form);
      setSuccessMsg(`Event "${form.title}" created successfully with ${form.totalSeats} auto-generated seats!`);
      setForm({
        title: "",
        description: "",
        date: "",
        venue: "",
        totalSeats: 40,
        seatPrice: 50,
      });
      await fetchDashboardData();
      setActiveTab("events");
    } catch (err) {
      setError(err.message || "Failed to create event.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;

    try {
      await api.deleteEvent(id);
      setSuccessMsg(`Event "${title}" deleted.`);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || "Failed to delete event.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>⚙️ Admin Control Center</h1>
          <p>Oversee events, auto-generate seating matrices, and monitor live transactions</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          Manage Events ({events.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          + Create New Event
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          All System Bookings ({allBookings.length})
        </button>
      </div>

      {loading ? (
        <div className="center-container">
          <div className="spinner"></div>
          <p>Loading dashboard records...</p>
        </div>
      ) : (
        <div className="tab-content">
          {/* TAB 1: EVENTS */}
          {activeTab === "events" && (
            <div className="admin-table-container">
              {events.length === 0 ? (
                <div className="empty-state">
                  <p>No events in database. Click "Create New Event" to get started.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Event Title</th>
                      <th>Date</th>
                      <th>Venue</th>
                      <th>Price</th>
                      <th>Capacity</th>
                      <th>Booked</th>
                      <th>Available</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev._id}>
                        <td>
                          <strong>{ev.title}</strong>
                        </td>
                        <td>{new Date(ev.date).toLocaleDateString()}</td>
                        <td>{ev.venue}</td>
                        <td>${ev.seatPrice}</td>
                        <td>{ev.totalSeats}</td>
                        <td>
                          <span className="badge-booked">{ev.bookedCount}</span>
                        </td>
                        <td>
                          <span className="badge-available">{ev.availableSeats}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link to={`/events/${ev._id}/book`} className="btn btn-outline btn-xs">
                              View Map
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev._id, ev.title)}
                              className="btn btn-danger-outline btn-xs"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 2: CREATE EVENT */}
          {activeTab === "create" && (
            <div className="admin-form-container">
              <div className="form-card">
                <h3>Schedule New Event</h3>
                <p>The system will automatically generate all individual seats (Rows A-Z, cols 1-10).</p>

                <form onSubmit={handleCreateEvent}>
                  <div className="form-group">
                    <label>Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coldplay Music of the Spheres"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      placeholder="Event details, line-up, special notices..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="form-control"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-half">
                      <label>Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group col-half">
                      <label>Venue / Hall</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Main Auditorium Hall B"
                        value={form.venue}
                        onChange={(e) => setForm({ ...form, venue: e.target.value })}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-half">
                      <label>Total Seats (Max 200)</label>
                      <input
                        type="number"
                        min="5"
                        max="200"
                        required
                        value={form.totalSeats}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            totalSeats: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="form-control"
                      />
                    </div>

                    <div className="form-group col-half">
                      <label>Seat Price ($ USD)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={form.seatPrice}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            seatPrice: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        className="form-control"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={creating} className="btn btn-primary btn-block btn-lg">
                    {creating ? "Generating Seating Matrix..." : "Create Event & Generate Seats"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: ALL BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="admin-table-container">
              {allBookings.length === 0 ? (
                <div className="empty-state">
                  <p>No bookings across the platform yet.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Customer</th>
                      <th>Event</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <code>{b.bookingReference}</code>
                        </td>
                        <td>
                          <strong>{b.user?.name || "User"}</strong>
                          <div className="user-email-sub">{b.user?.email}</div>
                        </td>
                        <td>{b.event?.title || "Event"}</td>
                        <td>
                          <div className="seat-badge-list">
                            {b.seats.map((s) => (
                              <span key={s} className="seat-badge sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>${b.totalAmount}</td>
                        <td>
                          <span className={`status-pill ${b.status}`}>{b.status}</span>
                        </td>
                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
