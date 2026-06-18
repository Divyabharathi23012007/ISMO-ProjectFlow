# ProjectFlow — Project Management System

A full-stack web application for managing projects and tasks, built with **React**, **Node.js/Express**, and **MySQL**.

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend  | Node.js, Express.js                     |
| Database | MySQL 8+ with Sequelize ORM             |
| Auth     | JWT (jsonwebtoken) + bcrypt             |
| Security | Helmet, CORS, express-rate-limit, express-validator |

---

## Project Structure

```
project-management/
├── backend/
│   ├── src/
│   │   ├── config/        # Database connection
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # Express routers
│   │   └── utils/         # JWT, response helpers
│   ├── server.js          # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance + service functions
│   │   ├── components/    # UI, auth, layout, projects, tasks, dashboard
│   │   ├── context/       # AuthContext
│   │   └── App.jsx        # Routes
│   └── .env.example
└── database/
    ├── schema.sql         # MySQL DDL
    └── er-diagram.mmd     # Mermaid ER diagram
```

---

## Prerequisites

- Node.js v18+
- MySQL 8+
- npm v9+

---

## Database Setup

1. Log into MySQL:
   ```bash
   mysql -u root -p
   ```

2. Create the database:
   ```sql
   CREATE DATABASE project_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. (Optional) Run the schema manually:
   ```bash
   mysql -u root -p project_management < database/schema.sql
   ```
   > Sequelize will auto-sync tables on first server start anyway.

---

## Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=project_management
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX=5               # max login attempts per window
```

Start the server:

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

App runs at: `http://localhost:5173`

---

## Environment Variables Reference

### Backend

| Variable               | Description                          | Default       |
|------------------------|--------------------------------------|---------------|
| `PORT`                 | Express server port                  | `5000`        |
| `NODE_ENV`             | Environment mode                     | `development` |
| `DB_HOST`              | MySQL host                           | `localhost`   |
| `DB_PORT`              | MySQL port                           | `3306`        |
| `DB_NAME`              | Database name                        | —             |
| `DB_USER`              | MySQL username                       | —             |
| `DB_PASSWORD`          | MySQL password                       | —             |
| `JWT_SECRET`           | Secret key for signing JWTs          | —             |
| `JWT_EXPIRES_IN`       | JWT expiry duration                  | `7d`          |
| `RATE_LIMIT_WINDOW_MS` | Auth rate limit window (ms)          | `900000`      |
| `RATE_LIMIT_MAX`       | Max auth attempts per window         | `5`           |

### Frontend

| Variable        | Description           |
|-----------------|-----------------------|
| `VITE_API_URL`  | Backend API base URL  |

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth Endpoints

#### POST `/auth/register`
Register a new user.

**Request body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": 1, "fullName": "Jane Doe", "email": "jane@example.com" },
    "token": "<jwt>"
  }
}
```

---

#### POST `/auth/login`
Login with email and password.

**Request body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { ... }, "token": "<jwt>" }
}
```

> Rate-limited to 5 attempts per 15 minutes per IP.

---

#### POST `/auth/logout` 🔒
Invalidates session on client side.

**Response `200`:** `{ "success": true, "message": "Logged out successfully" }`

---

#### GET `/auth/me` 🔒
Get current authenticated user.

**Response `200`:** `{ "success": true, "data": { "user": { ... } } }`

---

### Project Endpoints 🔒

All project endpoints require authentication. Users can only access their own projects.

#### GET `/projects`
Get all projects for the authenticated user.

**Query params:**

| Param       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| `search`    | string | Filter by project name (partial match)    |
| `status`    | string | `Not Started` / `In Progress` / `Completed` |
| `page`      | number | Page number (default: 1)                  |
| `limit`     | number | Results per page (default: 20)            |
| `sortBy`    | string | `name`, `status`, `startDate`, `createdAt` |
| `sortOrder` | string | `ASC` / `DESC`                            |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "projects": [ { "id": 1, "name": "Website Redesign", "status": "In Progress", ... } ],
    "pagination": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

---

#### GET `/projects/:id`
Get a single project with its tasks.

**Response `200`:** Project object with nested `tasks` array.

---

#### POST `/projects`
Create a new project.

**Request body:**
```json
{
  "name": "Website Redesign",
  "description": "Optional description",
  "status": "Not Started",
  "startDate": "2025-07-01",
  "endDate": "2025-09-30"
}
```
> `name` is required. `status` defaults to `Not Started`.

---

#### PUT `/projects/:id`
Update a project. Accepts any subset of project fields.

---

#### DELETE `/projects/:id`
Delete a project and all its tasks (cascade).

---

### Task Endpoints 🔒

#### GET `/tasks`
Get all tasks for the authenticated user.

**Query params:**

| Param       | Type   | Description                          |
|-------------|--------|--------------------------------------|
| `search`    | string | Filter by task name                  |
| `status`    | string | `Pending` / `In Progress` / `Completed` |
| `priority`  | string | `Low` / `Medium` / `High`            |
| `projectId` | number | Filter by project                    |
| `page`      | number | Page number                          |
| `limit`     | number | Results per page                     |
| `sortBy`    | string | `name`, `status`, `priority`, `dueDate`, `createdAt` |
| `sortOrder` | string | `ASC` / `DESC`                       |

---

#### GET `/tasks/:id`
Get a single task with its parent project.

---

#### POST `/tasks`
Create a task.

**Request body:**
```json
{
  "name": "Design wireframes",
  "projectId": 1,
  "description": "Create low-fidelity wireframes",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2025-07-15"
}
```
> `name` and `projectId` are required.

---

#### PUT `/tasks/:id`
Update a task. Accepts any subset of task fields.

---

#### DELETE `/tasks/:id`
Delete a task.

---

### Dashboard Endpoint 🔒

#### GET `/dashboard`
Get aggregate statistics for the authenticated user.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "projects": {
      "total": 5,
      "inProgress": 2,
      "completed": 1,
      "notStarted": 2
    },
    "tasks": {
      "total": 24,
      "completed": 8,
      "pending": 12,
      "inProgress": 4
    }
  }
}
```

---

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

| Status | Meaning                         |
|--------|---------------------------------|
| `400`  | Validation error                |
| `401`  | Unauthenticated                 |
| `403`  | Forbidden (not your resource)   |
| `404`  | Resource not found              |
| `409`  | Conflict (e.g. duplicate email) |
| `429`  | Too many requests (rate limit)  |
| `500`  | Internal server error           |

---

## Security Features

- **Passwords** hashed with bcrypt (cost factor 12)
- **JWT** authentication on all protected routes
- **Authorization** — users can only CRUD their own data (enforced in every query with `userId: req.user.id`)
- **SQL Injection** prevention via Sequelize ORM parameterized queries
- **Input validation** on all endpoints via express-validator
- **Rate limiting** on `/auth/register` and `/auth/login` (5 requests / 15 min per IP)
- **Helmet** sets security HTTP headers
- **CORS** restricted to frontend origin

---

## Database ER Diagram

```
USERS
  id (PK)
  fullName
  email (UNIQUE)
  password (bcrypt)
  createdAt, updatedAt
    |
    | 1:N
    v
PROJECTS
  id (PK)
  userId (FK → users.id, CASCADE DELETE)
  name, description
  status ENUM('Not Started','In Progress','Completed')
  startDate, endDate
  createdAt, updatedAt
    |
    | 1:N
    v
TASKS
  id (PK)
  projectId (FK → projects.id, CASCADE DELETE)
  userId (FK → users.id, CASCADE DELETE)
  name, description
  priority ENUM('Low','Medium','High')
  status ENUM('Pending','In Progress','Completed')
  dueDate
  createdAt, updatedAt
```

---

## Running Both Servers

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Bonus Features Implemented

- ✅ Pagination on all list endpoints
- ✅ Sorting on all list endpoints
- ✅ Search + multi-filter (status, priority, project)
- ✅ Progress bars on project cards
- ✅ One-click task complete toggle
- ✅ Responsive mobile layout

---

## Design Decisions

1. **Sequelize ORM** — prevents SQL injection, provides clean model definitions and migration-friendly `sync`.
2. **JWT stored in localStorage** — simple for an assessment; production would use httpOnly cookies.
3. **Cascade deletes** — deleting a project removes all its tasks; deleting a user removes all projects and tasks.
4. **Authorization at query level** — every DB query scopes to `userId: req.user.id`, so even a crafted request cannot access another user's data.
5. **Consistent API shape** — every response follows `{ success, message, data }` making frontend handling uniform.
