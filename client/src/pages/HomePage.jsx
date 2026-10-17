import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-pill">⚡ Concurrency-Safe Live Booking</span>
          <h1 className="hero-title">
            Reserve Your Ideal Seat in <span className="text-gradient">Real Time</span>
          </h1>
          <p className="hero-subtitle">
            A high-performance event seating and ticketing platform engineered with ACID transaction guarantees,
            real-time visual seat allocation, and role-based access control.
          </p>
          <div className="hero-cta-group">
            <Link to="/events" className="btn btn-primary btn-lg">
              Browse Live Events ➔
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary btn-lg">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Concurrency-Safe Checkout</h3>
          <p>
            Eliminates double-booking race conditions through multi-document ACID MongoDB transactions, ensuring guaranteed seat integrity under concurrent traffic.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🪑</div>
          <h3>Interactive Stage Grid</h3>
          <p>
            Dynamic visual seat map with real-time seat availability status, instant multi-seat selection, and dynamic price breakdown.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Role-Based Access Control</h3>
          <p>
            Secure JWT authentication with granular customer and admin capabilities, including event creation, management, and ticket monitoring.
          </p>
        </div>
      </section>

      {/* Quick Quickstart Banner */}
      <section className="demo-banner">
        <div className="demo-banner-content">
          <h3>Ready to test the assessment?</h3>
          <p>
            Log in with the pre-seeded admin account (<code>admin@example.com</code> / <code>admin123456</code>) to create and manage events, or register a customer account to test real-time booking!
          </p>
          <div className="banner-buttons">
            <Link to="/login" className="btn btn-outline">
              Sign In Demo
            </Link>
            <Link to="/events" className="btn btn-primary">
              View Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
