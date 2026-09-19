-- ============================================================
-- MIGRATION 003 — category sections (Watches vs Accessories)
-- Run this once in phpMyAdmin on your existing database.
-- New installs don't need this — schema.sql + seed.sql already
-- reflect this structure.
--
-- This version is SAFE TO RUN MORE THAN ONCE — if you already ran
-- an earlier version of this file and hit an error partway through,
-- just run this whole file again from the top. Every step below
-- either skips itself if already done, or is harmless to repeat.
--
-- What this does:
--   1. Adds a `section` column to categories: 'watches' or 'accessories'
--      (skipped if the column already exists)
--   2. Adds real watch types: Analog, Chronograph, Diver, Dress, Smart Watch
--      (skipped for any that already exist)
--   3. Moves your 6 known sample products into the matching new sub-category
--   4. Safety net: reassigns ANY other product still pointing at the old
--      generic "Watches" category — e.g. one you added yourself — to
--      Analog, so nothing is ever left behind or blocks the next step
--   5. Removes the old generic "Watches" category (only runs if it
--      still exists)
-- ============================================================
USE meridian_store;

-- 1. Add the section column, only if it doesn't already exist.
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS section ENUM('watches', 'accessories') NOT NULL DEFAULT 'accessories' AFTER slug;

-- 2. Add the real watch sub-categories (INSERT IGNORE = skip any that
--    already exist, based on the unique slug).
INSERT IGNORE INTO categories (name, slug, section, is_active, sort_order) VALUES
('Analog', 'analog-watches', 'watches', 1, 0),
('Chronograph', 'chronograph-watches', 'watches', 1, 1),
('Diver', 'diver-watches', 'watches', 1, 2),
('Dress', 'dress-watches', 'watches', 1, 3),
('Smart Watch', 'smart-watches', 'watches', 1, 4);

-- 3. Move the 6 known sample products into their matching sub-category
--    (only takes effect for whichever of these still exist in your DB).
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'chronograph-watches')
  WHERE slug IN ('chrono-black', 'field-chrono-olive');
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'analog-watches')
  WHERE slug = 'heritage-steel';
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'dress-watches')
  WHERE slug IN ('minimal-gold-line', 'skeleton-automatic');
UPDATE products SET category_id = (SELECT id FROM categories WHERE slug = 'diver-watches')
  WHERE slug = 'diver-blue-200m';

-- 4. Safety net — catch ANY product still pointing at the old generic
--    "Watches" category (for example one you added yourself through
--    the admin panel or a CSV import since we started this project).
--    Without this, step 5 below would fail with a foreign key error
--    if even one product was left behind.
UPDATE products
  SET category_id = (SELECT id FROM categories WHERE slug = 'analog-watches')
  WHERE category_id = (SELECT id FROM categories WHERE slug = 'watches');

-- 5. Remove the old generic "Watches" category — safe now, guaranteed
--    nothing references it after step 4. Does nothing if it's already gone.
DELETE FROM categories WHERE slug = 'watches';