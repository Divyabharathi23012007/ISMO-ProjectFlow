-- ============================================================
-- Project Management System — MySQL Schema
-- Run this AFTER creating the database:
--   CREATE DATABASE project_management;
--   USE project_management;
-- Sequelize auto-syncs tables on startup, but this file
-- serves as documentation and for manual setup / deployment.
-- ============================================================

CREATE DATABASE IF NOT EXISTS project_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE project_management;

-- ------------------------------------------------------------
-- Table: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT           NOT NULL AUTO_INCREMENT,
  fullName    VARCHAR(100)  NOT NULL,
  email       VARCHAR(255)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,          -- bcrypt hash, never plain-text
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: projects
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id          INT           NOT NULL AUTO_INCREMENT,
  userId      INT           NOT NULL,
  name        VARCHAR(200)  NOT NULL,
  description TEXT          NULL,
  status      ENUM('Not Started','In Progress','Completed')
                            NOT NULL DEFAULT 'Not Started',
  startDate   DATE          NULL,
  endDate     DATE          NULL,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_projects_userId   (userId),
  KEY idx_projects_status   (status),
  KEY idx_projects_name     (name),
  CONSTRAINT fk_projects_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Table: tasks
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          INT           NOT NULL AUTO_INCREMENT,
  projectId   INT           NOT NULL,
  userId      INT           NOT NULL,
  name        VARCHAR(200)  NOT NULL,
  description TEXT          NULL,
  priority    ENUM('Low','Medium','High')
                            NOT NULL DEFAULT 'Medium',
  status      ENUM('Pending','In Progress','Completed')
                            NOT NULL DEFAULT 'Pending',
  dueDate     DATE          NULL,
  createdAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  KEY idx_tasks_projectId   (projectId),
  KEY idx_tasks_userId      (userId),
  KEY idx_tasks_status      (status),
  KEY idx_tasks_priority    (priority),
  CONSTRAINT fk_tasks_project
    FOREIGN KEY (projectId) REFERENCES projects (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tasks_user
    FOREIGN KEY (userId) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
