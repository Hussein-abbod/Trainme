-- =============================================================
-- TrainMe — MySQL Database Setup Script
-- Run this ONCE before starting the backend.
-- Usage: mysql -u root -p < database/init.sql
-- =============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS trainme_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Create dedicated user (recommended over using root)
-- Replace 'your_password' with a strong password
-- CREATE USER IF NOT EXISTS 'trainme_user'@'localhost' IDENTIFIED BY 'your_password';
-- GRANT ALL PRIVILEGES ON trainme_db.* TO 'trainme_user'@'localhost';
-- FLUSH PRIVILEGES;

USE trainme_db;

SELECT 'TrainMe database created successfully!' AS status;
