# API Documentation — ProjectFlow

**Base URL:** `http://localhost:5000/api`

All responses follow this shape:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

Error responses may include an additional `errors` array with field-level validation details.

---

## Authentication

### POST /api/auth/register

Creates a new user account.

**Rate limited** — 5 requests per 15 minutes per IP.

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| fullName | string | yes | 2–100 characters |
| email | string | yes | Must be a valid, unique email |
| password | string | yes | Minimum 6 characters |

**Example request:**
```json
{
  "fullName": "Divya R",
  "email": "divya@example.com",
  "password": "secret123"
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "fullName": "Divya R",
      "email": "divya@example.com",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    },
    "token": "<jwt>"
  }
}
```

**Error codes:** `400` validation failed · `409` email already in use

---

### POST /api/auth/login

Authenticates a user and returns a JWT.

**Rate limited** — 5 requests per 15 minutes per IP.

**Request body:**

| Field | Type | Required |
|---|---|---|
| email | string | yes |
| password | string | yes |

**200 OK:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": 1, "fullName": "Divya R", "email": "divya@example.com" },
    "token": "<jwt>"
  }
}
```

**Error codes:** `400` validation failed · `401` invalid credentials

---

### POST /api/auth/logout

Invalidates the session on the client side (JWT is stateless; discard the token).

**Auth required:** Yes

**200 OK:**
```json
{ "success": true, "message": "Logged out successfully", "data": null }
```

---

### GET /api/auth/me

Returns the currently authenticated user.

**Auth required:** Yes

**200 OK:**
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "user": { "id": 1, "fullName": "Divya R", "email": "divya@example.com" }
  }
}
```

---

## Authentication Header

All protected endpoints require:

```
Authorization: Bearer <token>
```

---

## Projects

All project endpoints are protected. Users can only access their own projects.

### GET /api/projects

Returns a paginated list of the authenticated user's projects.

**Query parameters:**

| Parameter | Type | Default | Notes |
|---|---|---|---|
| search | string | — | Partial match on project name |
| status | string | — | `Not Started` · `In Progress` · `Completed` |
| page | integer | 1 | Pagination page number |
| limit | integer | 20 | Results per page |
| sortBy | string | `createdAt` | `name` · `status` · `startDate` · `endDate` · `createdAt` |
| sortOrder | string | `DESC` | `ASC` · `DESC` |

**200 OK:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "projects": [
      {
        "id": 1,
        "userId": 1,
        "name": "Website Redesign",
        "description": "Redesign the company site",
        "status": "In Progress",
        "startDate": "2025-01-01",
        "endDate": "2025-03-31",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "updatedAt": "2025-01-05T12:00:00.000Z",
        "tasks": [
          { "id": 1, "status": "Completed" },
          { "id": 2, "status": "Pending" }
        ]
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### GET /api/projects/:id

Returns a single project with all its tasks.

**Path parameter:** `id` — integer project ID

**200 OK:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "project": {
      "id": 1,
      "name": "Website Redesign",
      "status": "In Progress",
      "tasks": [ { "id": 1, "name": "Design mockups", "status": "Completed", "priority": "High" } ]
    }
  }
}
```

**Error codes:** `404` project not found or not owned by user

---

### POST /api/projects

Creates a new project.

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | yes | Max 200 characters |
| description | string | no | |
| status | string | no | Default: `Not Started` |
| startDate | string | no | ISO date `YYYY-MM-DD` |
| endDate | string | no | ISO date, must be after startDate |

**Example request:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign the company site",
  "status": "Not Started",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31"
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": { "project": { "id": 3, "name": "Website Redesign", ... } }
}
```

**Error codes:** `400` validation failed

---

### PUT /api/projects/:id

Updates an existing project. All fields are optional.

**Path parameter:** `id` — integer project ID

**Request body:** Same fields as POST (all optional)

**200 OK:**
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": { "project": { "id": 1, "name": "Website Redesign v2", ... } }
}
```

**Error codes:** `400` validation failed · `404` not found

---

### DELETE /api/projects/:id

Deletes a project and all its associated tasks (cascade).

**Path parameter:** `id` — integer project ID

**200 OK:**
```json
{ "success": true, "message": "Project deleted successfully", "data": null }
```

**Error codes:** `404` not found

---

## Tasks

All task endpoints are protected. Users can only access tasks that belong to their own projects.

### GET /api/tasks

Returns a paginated list of the authenticated user's tasks.

**Query parameters:**

| Parameter | Type | Default | Notes |
|---|---|---|---|
| search | string | — | Partial match on task name |
| status | string | — | `Pending` · `In Progress` · `Completed` |
| priority | string | — | `Low` · `Medium` · `High` |
| projectId | integer | — | Filter tasks by project |
| page | integer | 1 | |
| limit | integer | 20 | |
| sortBy | string | `createdAt` | `name` · `status` · `priority` · `dueDate` · `createdAt` |
| sortOrder | string | `DESC` | `ASC` · `DESC` |

**200 OK:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "tasks": [
      {
        "id": 1,
        "projectId": 1,
        "userId": 1,
        "name": "Design mockups",
        "description": "Create Figma wireframes",
        "priority": "High",
        "status": "In Progress",
        "dueDate": "2025-02-01",
        "createdAt": "2025-01-05T10:00:00.000Z",
        "updatedAt": "2025-01-06T09:00:00.000Z",
        "project": { "id": 1, "name": "Website Redesign" }
      }
    ],
    "pagination": { "total": 12, "page": 1, "limit": 20, "totalPages": 1 }
  }
}
```

---

### GET /api/tasks/:id

Returns a single task with its parent project info.

**Path parameter:** `id` — integer task ID

**200 OK:**
```json
{
  "success": true,
  "data": {
    "task": {
      "id": 1,
      "name": "Design mockups",
      "project": { "id": 1, "name": "Website Redesign", "status": "In Progress" }
    }
  }
}
```

**Error codes:** `404` not found

---

### POST /api/tasks

Creates a new task under a project.

**Request body:**

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | yes | Max 200 characters |
| projectId | integer | yes | Must belong to the authenticated user |
| description | string | no | |
| priority | string | no | Default: `Medium` · `Low` · `Medium` · `High` |
| status | string | no | Default: `Pending` · `Pending` · `In Progress` · `Completed` |
| dueDate | string | no | ISO date `YYYY-MM-DD` |

**Example request:**
```json
{
  "name": "Design mockups",
  "projectId": 1,
  "priority": "High",
  "status": "Pending",
  "dueDate": "2025-02-01"
}
```

**201 Created:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { "task": { "id": 5, "name": "Design mockups", ... } }
}
```

**Error codes:** `400` validation failed · `404` project not found or not owned by user

---

### PUT /api/tasks/:id

Updates an existing task. All fields are optional.

**Path parameter:** `id` — integer task ID

**Request body:**

| Field | Type | Notes |
|---|---|---|
| name | string | Max 200 characters |
| description | string | |
| priority | string | `Low` · `Medium` · `High` |
| status | string | `Pending` · `In Progress` · `Completed` |
| dueDate | string | ISO date `YYYY-MM-DD` |

**200 OK:**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": { "task": { "id": 1, "status": "Completed", ... } }
}
```

**Error codes:** `400` validation failed · `404` not found

---

### DELETE /api/tasks/:id

Deletes a task.

**Path parameter:** `id` — integer task ID

**200 OK:**
```json
{ "success": true, "message": "Task deleted successfully", "data": null }
```

**Error codes:** `404` not found

---

## Dashboard

### GET /api/dashboard

Returns summary statistics for the authenticated user.

**Auth required:** Yes

**200 OK:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "projects": {
      "total": 5,
      "inProgress": 2,
      "completed": 1,
      "notStarted": 2
    },
    "tasks": {
      "total": 20,
      "completed": 8,
      "pending": 7,
      "inProgress": 5
    }
  }
}
```

---

## Error Reference

| Status | Meaning |
|---|---|
| 400 | Validation failed — check `errors` array for field-level details |
| 401 | Unauthenticated — missing, expired, or invalid token |
| 404 | Resource not found or not owned by you |
| 409 | Conflict — e.g. email already registered |
| 429 | Rate limit exceeded (auth endpoints only) |
| 500 | Internal server error |

**Validation error example:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```
