-- ============================================================
-- MIGRATION 005 — rename the database itself
-- meridian_store → eternal_mens_store
--
-- Run this AFTER migration_004 (so your data is already rebranded
-- first). This is the step that actually renames the database.
--
-- Why this looks the way it does: MySQL/MariaDB removed the
-- "RENAME DATABASE" command years ago (it was unsafe). The correct,
-- fast, and safe way to do it instead is: create the new empty
-- database, then RENAME each table into it (this is a near-instant
-- metadata change, not a slow copy of your data), then delete the
-- now-empty old database.
--
-- After running this, your site is fully on eternal_mens_store —
-- includes/db.php already points to that name.
-- ============================================================

CREATE DATABASE IF NOT EXISTS eternal_mens_store
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

RENAME TABLE
  meridian_store.admins TO eternal_mens_store.admins,
  meridian_store.categories TO eternal_mens_store.categories,
  meridian_store.products TO eternal_mens_store.products,
  meridian_store.product_images TO eternal_mens_store.product_images,
  meridian_store.product_variants TO eternal_mens_store.product_variants,
  meridian_store.reviews TO eternal_mens_store.reviews,
  meridian_store.customers TO eternal_mens_store.customers,
  meridian_store.addresses TO eternal_mens_store.addresses,
  meridian_store.orders TO eternal_mens_store.orders,
  meridian_store.order_items TO eternal_mens_store.order_items,
  meridian_store.inventory_logs TO eternal_mens_store.inventory_logs,
  meridian_store.discounts TO eternal_mens_store.discounts,
  meridian_store.discount_products TO eternal_mens_store.discount_products,
  meridian_store.newsletter_subscribers TO eternal_mens_store.newsletter_subscribers;

DROP DATABASE meridian_store;