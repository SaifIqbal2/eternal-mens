-- ============================================================
-- MIGRATION 006 — add contact_messages table
-- Run this once in phpMyAdmin on your existing database.
-- New installs don't need this — schema.sql already includes it.
--
-- Until now, the Contact page validated messages and showed a
-- "thanks" screen, but the message itself was never saved or sent
-- anywhere — it just disappeared. This table gives it somewhere
-- real to go, and admin/messages.php lets you read them.
-- ============================================================
USE eternal_mens_store;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
