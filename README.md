# ⬤ Orbit Event Management Platform — v2.0

A polished, production-ready full-stack event management web application built with **Node.js + Express + MongoDB** (backend) and **Vanilla HTML/CSS/JS** (frontend).

---

## 🚀 What's New in v2.0

### 🔐 Authentication & Session Handling
- **JWT-based auth** — replaced insecure localStorage-only approach with signed JSON Web Tokens
- **Persistent sessions** — token stored in `localStorage`; expiry decoded client-side (7-day default)
- **Auth guards** — `requireAuth()` on all protected pages; unauthorized users auto-redirected to login
- **Redirect if logged in** — login/register pages redirect to dashboard if already authenticated
- **Logout** wires to all nav buttons, clears token and user data cleanly
- **No re-login prompts** — returning users land directly on dashboard

### 🎨 UI/UX Redesign (Complete Overhaul)
- **Unified Bootstrap removed** — replaced with a custom design system using CSS variables
- **Consistent color palette** — `--brand: #6c47ff` with complementary accents
- **Typography** — Syne (headings) + DM Sans (body) — professional and distinctive
- **Auth pages** — split-panel layout with animated gradient visual panel
- **Dashboard** — sidebar navigation + stat cards + quick actions grid
- **Event cards** — image hover zoom, slot badges, smooth transitions
- **All pages responsive** — tested down to 375px

### 🧭 Navigation Fixes
- **Home button** redirects to `dashboard.html` when logged in (updated in `initHomePage()`)
- **Navbar** dynamically shows/hides Login/Register vs Dashboard/Logout based on auth state
- **Sidebar** highlights active page link
- **Hamburger menu** on mobile

### ⚙️ Code Quality
- **Removed all debug `console.log`** including the one that was logging password hashes to console
- **Removed duplicate `app.use(cors())`** call in `server.js`
- **Fixed broken JS syntax** — unclosed `}` in booking form handler
- **Fixed `data.success` mismatch** — register endpoint now returns `{ success: true }` consistently
- **Login form** no longer asks for "Name" (which was wrong — login needs email + password only)
- **Shared `auth.js`** utility file for all auth helpers, prevents code duplication
- **`apiFetch()`** wrapper auto-attaches JWT Bearer token to every API call

### 🛠️ Backend Improvements
- Added **`jsonwebtoken`** to dependencies (was missing entirely)
- **Password never logged** — all debug console.logs removed
- **`select: false`** on password field — never returned in API responses by default
- **`protect` middleware** — JWT verification on all private routes
- **`/api/users/me`** route — get current user profile
- **`/api/bookings/my`** route — get user's own bookings
- **`deleteEvent`** route added
- **Global 404 + error handlers** added to `server.js`
- **Express 4** used instead of 5 (more stable for production)

### ✨ Features Added
- **Toast notifications** — success/error/info toasts with smooth animation (no more `alert()`)
- **Inline field validation errors** — shown under inputs, not as alerts
- **Loading states** — buttons disable + show "Please wait…" during API calls
- **Password strength meter** — live color bar + label on register page
- **Password visibility toggle** — both login and register pages
- **Pre-fill booking form** — name/email auto-filled from logged-in user data
- **Event URL params** — clicking "Book Now" passes event name/date to booking page
- **Delete event** button on each event card (calls DELETE API)
- **Animated stat counters** on dashboard

---

## 📁 Project Structure

```
orbit-upgraded/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js     # Register, login, getMe
│   │   ├── eventController.js    # Get, add, delete events
│   │   └── bookingController.js  # Book event, my bookings
│   ├── middleware/
│   │   └── auth.js               # JWT protect middleware
│   ├── models/
│   │   ├── User.js               # User schema + JWT generation
│   │   ├── Event.js              # Event schema
│   │   └── Booking.js            # Booking schema
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── eventRoutes.js
│   │   └── bookingRoutes.js
│   ├── server.js                 # Express app entry point
│   ├── .env                      # Environment variables
│   └── package.json
│
└── frontend/
    ├── css/
    │   └── style.css             # Complete custom design system
    ├── js/
    │   ├── auth.js               # Shared auth utilities (JWT, guards, toasts)
    │   └── main.js               # Page-specific logic
    ├── images/                   # Copy your images here
    ├── index.html                # Landing page
    ├── login.html                # Sign in
    ├── register.html             # Create account
    ├── dashboard.html            # User dashboard
    ├── event-list.html           # Browse & manage events
    └── book-event.html           # Book a spot + QR code
```

---

## ⚡ How to Run

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Setup Backend

```bash
cd backend
npm install
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/orbit
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRE=7d
```

Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend runs at: `http://localhost:5000`

### 2. Setup Frontend

The frontend is pure HTML/CSS/JS — no build step required.

**Option A — Open directly:**
Open `frontend/index.html` in your browser.

**Option B — Serve with a local server (recommended):**
```bash
# Using VS Code Live Server extension (easiest)
# Or:
cd frontend
npx serve .
# Or:
python3 -m http.server 3000
```

Frontend runs at: `http://localhost:3000` (or whatever port)

> **Note:** Copy your original `images/` folder into `frontend/images/`

### 3. Test the Flow

1. Open `index.html` → click **Get Started Free**
2. Register with a valid password (8+ chars, uppercase, lowercase, number, special char)
3. You're redirected to dashboard — JWT token stored in browser
4. Navigate to Events → Add events → Book events
5. Close browser, reopen → you're still logged in ✓
6. Click Logout → redirected to login ✓

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | Public | Create account |
| POST | `/api/users/login` | Public | Login + receive JWT |
| GET | `/api/users/me` | Bearer JWT | Get current user |
| GET | `/api/events` | Bearer JWT | List all events |
| POST | `/api/events` | Bearer JWT | Create event |
| DELETE | `/api/events/:id` | Bearer JWT | Delete event |
| POST | `/api/bookings/book-event` | Bearer JWT | Book an event |
| GET | `/api/bookings/my` | Bearer JWT | My bookings |

---

## 🔒 Security Notes

- JWT secret must be a long random string in production (use `openssl rand -hex 64`)
- Set `NODE_ENV=production` in production
- Consider using HTTPS in production
- MongoDB URI should use a non-default port and credentials in production

---

*Built with ❤️ — Orbit v2.0*
