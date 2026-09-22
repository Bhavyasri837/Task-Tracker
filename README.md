# Task Tracker — MERN Task Management System

A full-stack task management app built with **MongoDB, Express, React, and Node.js (MERN)**, using **JWT authentication**. Built as a Round 1 SDE Intern + FTE assignment.

Each user can sign up, log in, and manage their own tasks — with search, filtering, sorting, pagination, and a simple analytics dashboard.

---

## 1. Architecture Overview

**Backend** (`/backend`) — a REST API built with Express and Mongoose.
- `models/` — Mongoose schemas (`User`, `Task`)
- `controllers/` — business logic for auth, tasks, analytics
- `routes/` — Express routers mapping URLs to controllers
- `middleware/` — JWT auth guard (`auth.js`), request validation (`validate.js`), centralized error handler (`errorHandler.js`)
- `config/db.js` — MongoDB connection
- `utils/` — small helpers (`ApiError`, `asyncHandler`)

Every task is stored with a `user` field (a reference to its owner). The `protect` middleware decodes the JWT on every request to `/api/tasks/*` and `/api/analytics`, and every task query is scoped with `{ user: req.user._id }` — so one user can never read, edit, or delete another user's tasks, even by guessing an ID.

**Frontend** (`/frontend`) — a Vite + React single-page app.
- `pages/` — top-level routes: `LoginPage`, `SignupPage`, `DashboardPage`
- `components/` — reusable UI pieces (task list, task form/modal, filter bar, pagination, analytics cards, navbar)
- `context/` — `AuthContext` (login state, persisted in `localStorage`) and `ThemeContext` (dark/light mode)
- `hooks/` — `useAuth`, `useTheme`, `useDebounce` (debounces the search box so it doesn't hit the API on every keystroke)
- `services/` — a shared Axios instance (attaches the JWT to every request) plus one file per API resource (`authService`, `taskService`, `analyticsService`)

The dashboard is the single screen where a logged-in user sees their analytics, searches/filters/sorts tasks, and creates/edits/deletes/completes tasks. `PrivateRoute` redirects anyone without a valid session back to `/login`.

**Why this structure:** it's the standard MERN layering (routes → controllers → models on the backend, pages → components → services on the frontend), which keeps concerns separated without introducing patterns that would be hard to explain in an interview.

---

## 2. Folder Structure

```
task-tracker/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/User.js
│   │   ├── models/Task.js
│   │   ├── controllers/authController.js
│   │   ├── controllers/taskController.js
│   │   ├── controllers/analyticsController.js
│   │   ├── middleware/auth.js
│   │   ├── middleware/validate.js
│   │   ├── middleware/errorHandler.js
│   │   ├── routes/authRoutes.js
│   │   ├── routes/taskRoutes.js
│   │   ├── routes/analyticsRoutes.js
│   │   ├── utils/ApiError.js
│   │   ├── utils/asyncHandler.js
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/ (Navbar, TaskList, TaskItem, TaskForm, FilterBar,
    │   │                Pagination, AnalyticsCards, LoadingSpinner,
    │   │                ErrorMessage, PrivateRoute)
    │   ├── pages/ (LoginPage, SignupPage, DashboardPage)
    │   ├── context/ (AuthContext, ThemeContext)
    │   ├── hooks/ (useAuth, useTheme, useDebounce)
    │   ├── services/ (api, authService, taskService, analyticsService)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 3. Setup Instructions

### Prerequisites
- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free MongoDB Atlas cluster

### 3.1 Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in your own values:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-tracker
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run it:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```

The API runs at `http://localhost:5000`. Check `GET /api/health` to confirm it's up.

### 3.2 Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` (Vite's default) and talks to the backend at `http://localhost:5000/api` by default. To point it elsewhere, create `frontend/.env` with:

```
VITE_API_URL=http://localhost:5000/api
```

### 3.3 MongoDB setup

**Option A — local MongoDB:** install MongoDB Community Server, then run `mongod`. The default `MONGODB_URI` above will work as-is; the `task-tracker` database and its collections are created automatically on first write.

**Option B — MongoDB Atlas (no local install):** create a free cluster at mongodb.com/atlas, add a database user, allow your IP, and copy the provided connection string into `MONGODB_URI` in `.env`.

---

## 4. API Endpoint Summary

All responses are JSON in the shape `{ success, data, ... }` on success, or `{ success: false, message }` on error.

### Auth (public)
| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

Both return `{ user, token }`. Send the token as `Authorization: Bearer <token>` on every request below.

### Tasks (protected — JWT required)
| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/tasks` | List the current user's tasks. Query params: `status`, `priority`, `search`, `page`, `limit`, `sortBy` (`dueDate` \| `priority`), `order` (`asc` \| `desc`) |
| GET | `/api/tasks/:id` | Get one task (must belong to the current user) |
| POST | `/api/tasks` | Create a task — `{ title, description, status, priority, dueDate }` |
| PUT | `/api/tasks/:id` | Update a task (partial updates allowed) |
| DELETE | `/api/tasks/:id` | Delete a task |

Example: `GET /api/tasks?status=Todo&priority=High&search=report&page=1&limit=10&sortBy=dueDate&order=asc`

### Analytics (protected)
| Method | Endpoint | Returns |
|---|---|---|
| GET | `/api/analytics` | `{ totalTasks, completedTasks, pendingTasks, completionPercentage }` |

---

## 5. Security Notes

- Passwords are hashed with **bcryptjs** before being saved; the hash is never returned in any API response (`select: false` on the schema, plus a custom `toJSON`).
- JWTs are signed with a secret read from `.env` — never hardcoded.
- Every task route runs through `protect` middleware that verifies the JWT and attaches `req.user`.
- Every task query/mutation is scoped to `req.user._id`, so users cannot see or modify each other's tasks even with a valid token.
- CORS is restricted to the configured `CLIENT_URL`.

---

## 6. Requirement Checklist

**Authentication**
- [x] Signup, [x] Login, [x] JWT, [x] Email/password validation, [x] bcrypt password hashing

**Task Management**
- [x] Create, [x] Read, [x] Update, [x] Delete, [x] Mark completed, [x] Tasks scoped per user

**Task Fields**
- [x] Title, [x] Description, [x] Status, [x] Priority, [x] Due date

**Filtering & Search**
- [x] Status filter, [x] Priority filter, [x] Title search (all via backend query params)

**Analytics**
- [x] Total tasks, [x] Completed tasks, [x] Pending tasks, [x] Completion percentage

**UI**
- [x] Clean UI, [x] Task list, [x] Create/update form, [x] Analytics section, [x] Loading states, [x] Error states

**Enhancements**
- [x] Pagination, [x] Sort by due date, [x] Sort by priority, [x] Responsive design, [x] Dark mode

**Technical**
- [x] Global error middleware, [x] Request validation, [x] Auth middleware, [x] MongoDB indexes, [x] Environment variables

---

## 7. Explicitly Out of Scope

Per the assignment, the following were intentionally **not** built: OAuth/Google login, OTP, email verification, refresh tokens, admin roles/RBAC, team collaboration, notifications, file uploads, comments, WebSockets/real-time updates, GraphQL, and advanced analytics/charts. Analytics is shown as simple stat cards, as specified.
# Task-Tracker
