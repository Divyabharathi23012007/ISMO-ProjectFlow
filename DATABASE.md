# Database Schema & ER Diagram — ProjectFlow

## Overview

ProjectFlow uses a **MySQL** relational database with 3 core tables: `users`, `projects`, and `tasks`.

---

## ER Diagram

```
┌──────────────────────┐         ┌──────────────────────────┐         ┌──────────────────────────┐
│        users         │         │         projects          │         │          tasks            │
├──────────────────────┤         ├──────────────────────────┤         ├──────────────────────────┤
│ PK  id       INT     │ 1    ∞  │ PK  id          INT      │ 1    ∞  │ PK  id          INT      │
│     fullName VARCHAR │─────────│ FK  userId      INT      │─────────│ FK  projectId   INT      │
│     email    VARCHAR │         │     name        VARCHAR  │         │ FK  userId      INT      │
│     password VARCHAR │         │     description TEXT     │         │     name        VARCHAR  │
│     createdAt DATETIME│        │     status      ENUM     │         │     description TEXT     │
│     updatedAt DATETIME│        │     startDate   DATE     │         │     priority    ENUM     │
└──────────────────────┘         │     endDate     DATE     │         │     status      ENUM     │
                                 │     createdAt   DATETIME │         │     dueDate     DATE     │
         1                       │     updatedAt   DATETIME │         │     createdAt   DATETIME │
         │                       └──────────────────────────┘         │     updatedAt   DATETIME │
         │ ∞                                                           └──────────────────────────┘
         └─────────────────────────────────────────────────────────────────────────────────────────
```

---

## Tables

### 1. `users`
Stores registered user accounts.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user ID |
| `fullName` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(191) | NOT NULL, UNIQUE | Login email address |
| `password` | VARCHAR(255) | NOT NULL | bcrypt hashed password (never plain-text) |
| `createdAt` | DATETIME | DEFAULT NULL | Record creation timestamp (managed by Sequelize) |
| `updatedAt` | DATETIME | DEFAULT NULL | Last update timestamp (managed by Sequelize) |

---

### 2. `projects`
Stores projects created by users.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique project ID |
| `userId` | INT | NOT NULL, FK → users.id | Owner of the project |
| `name` | VARCHAR(200) | NOT NULL | Project name |
| `description` | TEXT | NULL | Optional project description |
| `status` | ENUM | NOT NULL, DEFAULT 'Not Started' | `Not Started` / `In Progress` / `Completed` |
| `startDate` | DATE | NULL | Project start date |
| `endDate` | DATE | NULL | Project end date (must be after startDate) |
| `createdAt` | DATETIME | DEFAULT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | DEFAULT NULL | Last update timestamp |

**Indexes:**
- `idx_projects_userId` on `userId`
- `idx_projects_status` on `status`
- `idx_projects_name` on `name`

---

### 3. `tasks`
Stores tasks that belong to projects.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique task ID |
| `projectId` | INT | NOT NULL, FK → projects.id | Parent project |
| `userId` | INT | NOT NULL, FK → users.id | Task owner |
| `name` | VARCHAR(200) | NOT NULL | Task name |
| `description` | TEXT | NULL | Optional task description |
| `priority` | ENUM | NOT NULL, DEFAULT 'Medium' | `Low` / `Medium` / `High` |
| `status` | ENUM | NOT NULL, DEFAULT 'Pending' | `Pending` / `In Progress` / `Completed` |
| `dueDate` | DATE | NULL | Task due date |
| `createdAt` | DATETIME | DEFAULT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | DEFAULT NULL | Last update timestamp |

**Indexes:**
- `idx_tasks_projectId` on `projectId`
- `idx_tasks_userId` on `userId`
- `idx_tasks_status` on `status`
- `idx_tasks_priority` on `priority`

---

## Relationships

| Relationship | Type | Cascade |
|---|---|---|
| `users` → `projects` | One-to-Many | Delete user → deletes all their projects |
| `users` → `tasks` | One-to-Many | Delete user → deletes all their tasks |
| `projects` → `tasks` | One-to-Many | Delete project → deletes all its tasks |

---

## SQL Schema (Production-ready)

```sql
SET sql_mode = '';

CREATE TABLE IF NOT EXISTS users (
  id        INT          NOT NULL AUTO_INCREMENT,
  fullName  VARCHAR(100) NOT NULL,
  email     VARCHAR(191) NOT NULL,
  password  VARCHAR(255) NOT NULL,
  createdAt DATETIME     DEFAULT NULL,
  updatedAt DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS projects (
  id          INT          NOT NULL AUTO_INCREMENT,
  userId      INT          NOT NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT         NULL,
  status      ENUM('Not Started','In Progress','Completed') NOT NULL DEFAULT 'Not Started',
  startDate   DATE         NULL,
  endDate     DATE         NULL,
  createdAt   DATETIME     DEFAULT NULL,
  updatedAt   DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_projects_userId (userId),
  KEY idx_projects_status (status),
  KEY idx_projects_name   (name),
  CONSTRAINT fk_projects_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS tasks (
  id          INT          NOT NULL AUTO_INCREMENT,
  projectId   INT          NOT NULL,
  userId      INT          NOT NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT         NULL,
  priority    ENUM('Low','Medium','High')               NOT NULL DEFAULT 'Medium',
  status      ENUM('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  dueDate     DATE         NULL,
  createdAt   DATETIME     DEFAULT NULL,
  updatedAt   DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_tasks_projectId (projectId),
  KEY idx_tasks_userId    (userId),
  KEY idx_tasks_status    (status),
  KEY idx_tasks_priority  (priority),
  CONSTRAINT fk_tasks_project
    FOREIGN KEY (projectId) REFERENCES projects(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tasks_user
    FOREIGN KEY (userId) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

---

## Technology

- **Database:** MySQL 8.x
- **ORM:** Sequelize v6
- **Hosting:** FreeSQLDatabase.com (production)
- **Timestamps:** Auto-managed by Sequelize on every create/update
- **Passwords:** Hashed with bcrypt (12 salt rounds) via Sequelize `beforeCreate` hook — plain-text passwords are never stored
