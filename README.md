# 🎟️ SeatBooking — MERN Stack Event Reservation Platform

A small, high-performance web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) featuring an interactive stage seat matrix, role-based authorization (Customer vs Admin), and a **concurrency-safe ACID transactional checkout flow** to prevent double-booking race conditions under high traffic.

---

## 🌟 Key Features

### 1. Concurrency-Safe Transactional Booking
- Eliminates seat reservation race conditions using **MongoDB Multi-Document ACID Transactions** (`mongoose.startSession()`).
- Atomic verification and state transition: before persisting a booking, all selected seats are re-verified within the transaction to ensure none were booked concurrently.
- Automatic conflict detection (`HTTP 409 Conflict`) with instant UI recovery and seat grid re-fetching.

### 2. Interactive Dynamic Seat Map
- Visual curved stage layout (`STAGE / SCREEN`) with row markers (A–Z) and seat indices (1–10).
- Real-time seat statuses: **Available** (green), **Selected** (indigo/purple), and **Booked** (gray/strikethrough).
- Multi-seat selection with real-time price calculation, quantity limits (max 10 seats per order), and individual seat cancellation pills.

### 3. Role-Based Authorization & Authentication
- Secure authentication utilizing **JSON Web Tokens (JWT)** and **bcryptjs** password hashing (12 salt rounds).
- Granular permissions:
  - **Customer**: Browse events, reserve seats, view booking confirmations, cancel personal reservations with automatic seat release.
  - **Admin**: Dedicated Admin Portal to schedule new events (which auto-generates seating layouts), manage/delete events, and audit platform-wide bookings.

### 4. Clean & Maintainable Architecture
- Layered MVC architecture on the backend (`controllers`, `models`, `routes`, `middleware`, `config`).
- Modular React 19 frontend with client-side routing via React Router, Context-based state management (`AuthContext`), and reusable components.

---

## 🛠️ Technologies Used

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite, React Router v7 | Responsive UI, single-page application |
| **Backend** | Node.js, Express.js 5 | RESTful API, centralized error handling |
| **Database** | MongoDB Atlas / Mongoose 9 | Document storage with Replica Set transactions |
| **Security** | JWT (jsonwebtoken), bcryptjs, CORS | Bearer token auth & password hashing |
| **Dev Environment** | Code0 AI Extension for VS Code | Architecture scaffolding, API & schema design |

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB replica set for transaction support)

### 1. Clone the Repository
```bash
git clone https://github.com/rammishra07/SeatBooking_App.git
cd SeatBooking_App
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
Create `server/.env` (refer to `server/.env.example`):
```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/seatbooking?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key-2026
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
ADMIN_SEED_NAME=Admin User
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=admin123456
```

**Frontend (`client/.env`):**
Create `client/.env` (refer to `client/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Seed the Database
Seed the pre-configured administrator account:
```bash
cd server
node seedAdmin.js
```
*Output: `Admin account seeded successfully: admin@example.com role: admin`*

---

## 💻 Running the Application

### Option 1: Run Backend & Frontend Separately

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

### Option 2: Run from Root Directory
```bash
npm run server   # Starts Express backend
npm run client   # Starts Vite React frontend
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 🔑 Demo & Evaluation Credentials

To test both role-based flows:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123456` | Full access: Admin Control Center, create events, audit bookings |
| **Customer** | Register via `/register` or sign in | Any valid password | Book seats, manage reservations, cancel tickets |

> *Tip: The Login page includes an **"⚡ Fill Pre-Seeded Admin Credentials"** button for quick evaluation.*

---

## 🤖 AI Development Experience with Code0

### Confirmation of Tooling
**Code0** was utilized as a core part of the engineering workflow for this project within Visual Studio Code, guiding the system design, iterative component development, and API structure.

### Workflow & Technical Decision-Making
Throughout development, Code0 served as an intelligent pair programmer:
1. **Accelerated Scaffolding**: Generated clean boilerplate for Express 5 and Vite + React 19, allowing immediate focus on core domain logic.
2. **Validating AI Suggestions**: Suggested patterns were critically assessed for data integrity — specifically ensuring that seat reservation was not simply an in-memory or single-document update, but backed by atomic transactions to avoid concurrency anomalies.
3. **Debugging & Refactoring**: Helped resolve environment configuration, modularize routes, and structure clean error handlers.

### 5 Specific Tasks Assisted by Code0
1. **Backend Scaffolding & MongoDB Connection**: Assisted in structuring `server/index.js` and `server/src/config/db.js` with CORS configuration, graceful error handling, and robust database connectivity.
2. **User Model & Authentication Flow**: Formulated `server/src/models/User.js` with bcrypt pre-save password hashing, JSON serialization masks (removing password hashes), and JWT token generation utility (`server/src/utils/jwt.js`).
3. **Role-Based Authorization Middleware**: Implemented `server/src/middleware/authenticate.js` to extract bearer tokens, verify payload signatures, and enforce role checks (`customer` vs `admin`) on sensitive endpoints.
4. **Concurrency-Safe Transactional Booking**: Collaborated on designing `createBooking` and `cancelBooking` in `server/src/controllers/bookingController.js` using Mongoose sessions to guarantee seat isolation and atomic commit/rollback.
5. **Interactive SeatMap Component**: Designed the SVG/CSS seat map matrix (`client/src/components/SeatMap.jsx`) with dynamic state management, stage layout curvature, and multi-seat selection limits.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Sign in and obtain JWT bearer token
- `GET /api/auth/me` — Retrieve current authenticated user profile *(Auth required)*

### Events (`/api/events`)
- `GET /api/events` — Retrieve all events with live seat availability counts *(Public)*
- `GET /api/events/:id` — Retrieve detailed event info with full seat grid *(Public)*
- `POST /api/events` — Create new event with automated seat generation *(Admin only)*
- `PUT /api/events/:id` — Update event metadata *(Admin only)*
- `DELETE /api/events/:id` — Delete event with booking dependency check *(Admin only)*

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Reserve seats via ACID transaction *(Customer/Admin)*
- `GET /api/bookings/my` — Fetch current user's reservations *(Customer/Admin)*
- `DELETE /api/bookings/:id` — Cancel reservation and release seats *(Owner/Admin)*
- `GET /api/bookings/all` — Audit all bookings across all events *(Admin only)*

---

## 📄 License
This project is developed for technical evaluation and licensed under the MIT License.
