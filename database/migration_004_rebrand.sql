-- ============================================================
-- MIGRATION 004 — rebrand: Meridian → Eternal Mens
-- Run this once in phpMyAdmin on your existing database.
-- New installs don't need this — schema.sql + seed.sql already
-- use the new name.
--
-- This updates the actual DATA in your database (not just code):
--   1. Every product's "Brand" field, shown on the product page
--   2. The sample admin account's email address
--
-- IMPORTANT: step 2 changes what email you log in with.
-- If you'd rather keep logging in with owner@meridian.test,
-- just delete/skip that UPDATE statement below before running this.
--
-- NOT changed here on purpose: the database's own internal name
-- (meridian_store). Nobody — customers or you — ever sees that
-- string anywhere on the site or in the admin panel; it's purely
-- a technical label MySQL uses internally. Renaming a live database
-- is a riskier, more advanced operation for zero visible benefit,
-- so I left it as-is. Tell me if you want it changed anyway and
-- I'll walk you through it safely.
-- ============================================================
USE meridian_store;

-- 1. Update the brand shown on every product page
UPDATE products SET brand = 'Eternal Mens' WHERE brand = 'Meridian';

-- 2. Update the sample admin account's email (OPTIONAL — see note above)
UPDATE admins SET email = 'owner@eternalmens.test' WHERE email = 'owner@meridian.test';
