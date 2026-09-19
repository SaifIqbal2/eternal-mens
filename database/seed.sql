-- ============================================================
-- SAMPLE DATA — run this AFTER schema.sql
-- ============================================================
USE eternal_mens_store;

-- Owner login:

INSERT INTO admins (name, email, password_hash, role) VALUES
('Store Owner', 'sahilmehar07@eternalmens.com', '$2y$10$qcE9MIhKZqPyjGxZtKfFTevKGVuS8fMAchmF5UVjFL.k1HdwT9mGS', 'OWNER');


-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (name, slug, section, is_active, sort_order) VALUES
('Analog', 'analog-watches', 'watches', 1, 0),
('Chronograph', 'chronograph-watches', 'watches', 1, 1),
('Diver', 'diver-watches', 'watches', 1, 2),
('Dress', 'dress-watches', 'watches', 1, 3),
('Smart Watch', 'smart-watches', 'watches', 1, 4),

('Sunglasses', 'sunglasses', 'accessories', 0, 5),
('Bracelets', 'bracelets', 'accessories', 0, 6),
('Rings', 'rings', 'accessories', 0, 7),
('Chains', 'chains', 'accessories', 0, 8);


-- ============================================================
-- SAMPLE PRODUCT
-- ============================================================

INSERT INTO products
  (name, slug, sku, brand, category_id, description, materials, dimensions, weight,
   price, compare_at_price, stock, low_stock_threshold, status, is_featured)
VALUES
(
  'dummy1',
  'dummy1',
  'DUMMY-001',
  'Eternal Mens',
  (SELECT id FROM categories WHERE slug = 'analog-watches'),
  'Placeholder product for testing and demonstration purposes.',
  'Stainless steel',
  '40mm case diameter',
  '80g',
  9999,
  NULL,
  10,
  2,
  'ACTIVE',
  0
);


-- ============================================================
-- PLACEHOLDER PRODUCT IMAGE
-- ============================================================

INSERT INTO product_images (product_id, url, alt_text, sort_order)
VALUES
(
  (SELECT id FROM products WHERE slug = 'dummy1'),
  'assets/images/products/0.jpg',
  'dummy1',
  0
);


-- ============================================================
--  VARIANT 
-- ============================================================

INSERT INTO product_variants
  (product_id, name, option_type, sku, stock)
VALUES
(
  (SELECT id FROM products WHERE slug = 'dummy1'),
  'Default',
  'Option',
  'DUMMY-001-DEF',
  10
);


-- ============================================================
-- INITIAL INVENTORY
-- ============================================================

INSERT INTO inventory_logs
  (product_id, previous_qty, change_qty, new_qty, reason)
VALUES
(
  (SELECT id FROM products WHERE slug = 'dummy1'),
  0,
  10,
  10,
  'INITIAL_STOCK'
);


-- ============================================================
-- SAMPLE DISCOUNT CODE
-- ============================================================

INSERT INTO discounts (code, type, value, is_active) VALUES
('WELCOME10', 'PERCENTAGE', 10, 1);