import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🎟️</span>
          <span className="brand-text">SeatBooking</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/events" className="nav-link">
            Explore Events
          </Link>

          {user && (
            <Link to="/my-bookings" className="nav-link">
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="nav-link admin-badge">
              Admin Portal
            </Link>
          )}
        </nav>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">
                Hello, <strong>{user.name.split(" ")[0]}</strong>
                {isAdmin && <span className="role-tag">Admin</span>}
              </span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
