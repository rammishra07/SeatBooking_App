const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("seatbooking_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || "API request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  getMe: () => apiRequest("/auth/me"),

  // Events
  getEvents: () => apiRequest("/events"),
  getEvent: (id) => apiRequest(`/events/${id}`),
  createEvent: (eventData) =>
    apiRequest("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }),
  updateEvent: (id, eventData) =>
    apiRequest(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }),
  deleteEvent: (id) =>
    apiRequest(`/events/${id}`, {
      method: "DELETE",
    }),

  // Bookings
  createBooking: (payload) =>
    apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getMyBookings: () => apiRequest("/bookings/my"),
  getAllBookings: () => apiRequest("/bookings/all"),
  cancelBooking: (id) =>
    apiRequest(`/bookings/${id}`, {
      method: "DELETE",
    }),
};
