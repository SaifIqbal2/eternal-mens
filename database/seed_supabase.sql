-- ============================================================
-- ETERNAL MENS — SUPABASE SEED DATA (FINAL SIMPLE VERSION)
-- ============================================================

-- 1. Activate accessory categories
UPDATE categories SET is_active = TRUE;

-- 2. Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- 3. Products
INSERT INTO products (id, category_id, name, slug, sku, price, compare_at_price, stock, status, is_featured, is_bestseller, description)
OVERRIDING SYSTEM VALUE VALUES
(1, 2, 'Meridian Chronograph Black', 'meridian-chronograph-black', 'EM-CHRONO-01', 14500, 17500, 15, 'ACTIVE', TRUE, TRUE, 'Engineered for the modern connoisseur. Triple-subdial chronograph.'),
(2, 4, 'Nocturne Minimalist Dress Watch', 'nocturne-minimalist-dress', 'EM-DRESS-02', 12800, 15000, 8, 'ACTIVE', TRUE, TRUE, 'Ultra-slim profile with deep obsidian dial and rose-gold accents.'),
(3, 3, 'Horizon Deep Ocean Diver', 'horizon-deep-ocean-diver', 'EM-DIVER-03', 18900, 22000, 12, 'ACTIVE', TRUE, FALSE, 'A robust diver with rotating ceramic bezel and 200m water resistance.'),
(4, 1, 'Heritage Classic Analog Gold', 'heritage-classic-analog-gold', 'EM-ANALOG-04', 11500, 13500, 20, 'ACTIVE', TRUE, FALSE, 'Champagne dial with Roman numerals and vintage gold case.'),
(5, 2, 'Eclipse Chronograph Silver Edition', 'eclipse-chronograph-silver', 'EM-CHRONO-05', 15200, 18000, 10, 'ACTIVE', TRUE, TRUE, 'Contrast monochromatic dial with dual chronograph registers.'),
(6, 8, 'Obsidian Signet Ring', 'obsidian-signet-ring', 'EM-RING-06', 3500, 4500, 25, 'ACTIVE', FALSE, TRUE, 'Hand-finished signet ring featuring natural black onyx stone.'),
(7, 7, 'Knotwork Braided Leather Bracelet', 'braided-leather-bracelet', 'EM-BRACE-07', 2800, 3500, 18, 'ACTIVE', FALSE, TRUE, 'Dual-strand genuine nappa leather with magnetic clasp.'),
(8, 6, 'Aero Aviator Polarized Sunglasses', 'aero-aviator-polarized-sunglasses', 'EM-SUN-08', 4200, 5500, 14, 'ACTIVE', FALSE, TRUE, 'Polarized TAC lenses with UV400 protection.')
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, status = 'ACTIVE', stock = EXCLUDED.stock;

-- Update ID sequence for products
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));

-- 4. Images
INSERT INTO product_images (product_id, url, alt_text, sort_order) VALUES
(1, '/assets/images/1.jpg', 'Meridian Chronograph', 0),
(1, '/assets/images/products/2.jpg', 'Meridian Side', 1),
(2, '/assets/images/products/0.jpg', 'Nocturne Dress Watch', 0),
(3, '/assets/images/products/3.jpg', 'Horizon Diver', 0),
(4, '/assets/images/products/6.jpg', 'Heritage Gold Watch', 0),
(5, '/assets/images/1.jpg', 'Eclipse Silver Chronograph', 0),
(6, '/assets/images/products/ring.jpg', 'Obsidian Signet Ring', 0),
(7, '/assets/images/bracelets.jpg', 'Braided Leather Bracelet', 0),
(8, '/assets/images/sunglasses.jpg', 'Polarized Sunglasses', 0)
ON CONFLICT DO NOTHING;

-- 5. Variants
INSERT INTO product_variants (product_id, name, option_type, sku, stock) VALUES
(1, 'Matte Black / Leather', 'Strap', 'EM-CHRONO-01-BLK', 10),
(1, 'Steel Mesh / Silver', 'Strap', 'EM-CHRONO-01-SLV', 5),
(2, 'Black Sunburst / 40mm', 'Size', 'EM-DRESS-02-40', 8),
(3, 'Deep Blue / Steel Link', 'Color', 'EM-DIVER-03-BLU', 12),
(6, 'US Size 9', 'Size', 'EM-RING-06-9', 10),
(6, 'US Size 10', 'Size', 'EM-RING-06-10', 15)
ON CONFLICT (sku) DO NOTHING;

-- 6. Initial Reviews
INSERT INTO reviews (product_id, author_name, rating, title, body, is_approved) VALUES
(1, 'Hamza Malik', 5, 'Exceptional craftsmanship', 'The weight and finish on this chronograph are remarkable.', TRUE),
(2, 'Zubair Khan', 5, 'Perfect dress watch', 'Extremely slim and slides effortlessly under shirt cuffs.', TRUE)
ON CONFLICT DO NOTHING;
