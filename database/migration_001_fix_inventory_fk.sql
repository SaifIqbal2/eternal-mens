-- ============================================================
-- MIGRATION 001 — fix inventory_logs foreign keys
-- Run this ONCE in phpMyAdmin if you already created your database
-- from the original schema.sql. New installs don't need this —
-- schema.sql already has the fix built in.
--
-- What this fixes: deleting a product used to fail with a database
-- error, because every product has at least one inventory history
-- entry (created the moment it's added), and that entry was blocking
-- the delete. This lets the history entry get cleaned up
-- automatically instead.
-- ============================================================
USE meridian_store;

ALTER TABLE inventory_logs DROP FOREIGN KEY inventory_logs_ibfk_1;
ALTER TABLE inventory_logs DROP FOREIGN KEY inventory_logs_ibfk_2;
ALTER TABLE inventory_logs DROP FOREIGN KEY inventory_logs_ibfk_3;
ALTER TABLE inventory_logs DROP FOREIGN KEY inventory_logs_ibfk_4;

ALTER TABLE inventory_logs
  ADD CONSTRAINT fk_invlog_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_invlog_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_invlog_order   FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_invlog_admin   FOREIGN KEY (admin_id)   REFERENCES admins(id) ON DELETE SET NULL;
