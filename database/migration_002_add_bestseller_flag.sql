-- ============================================================
-- MIGRATION 002 — add manual "Best Seller" flag to products
-- Run this once in phpMyAdmin on your existing database.
-- New installs don't need this — schema.sql already includes it.
-- ============================================================
USE meridian_store;

ALTER TABLE products
  ADD COLUMN is_bestseller TINYINT(1) NOT NULL DEFAULT 0 AFTER is_featured;
