-- ============================================================
-- ETERNAL MENS — FIX ALL RLS POLICIES & PERMISSIONS
-- ============================================================
-- Yeh code Supabase SQL Editor mein paste kar ke RUN karein.
-- Is se:
--   1. Checkout par "orders" RLS error theek ho jayega
--   2. Admin panel par Photo Upload error theek ho jayega
--   3. Admin panel par 401 Unauthorized theek ho jayega
--   4. Aapka user foran Admin ban jayega
-- ============================================================


-- ─── 1. STORAGE BUCKET & POLICIES (PHOTO UPLOAD FIX) ────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete product-images" ON storage.objects;

CREATE POLICY "Public Access product-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Allow Upload product-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow Update product-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Allow Delete product-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');


-- ─── 2. ORDERS & ORDER ITEMS (CHECKOUT RLS FIX) ─────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert order" ON orders;
DROP POLICY IF EXISTS "Public select order" ON orders;
DROP POLICY IF EXISTS "Admin manage orders" ON orders;
DROP POLICY IF EXISTS "Allow all orders" ON orders;

CREATE POLICY "Allow all orders" ON orders
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert order items" ON order_items;
DROP POLICY IF EXISTS "Public read order items" ON order_items;
DROP POLICY IF EXISTS "Admin manage order items" ON order_items;
DROP POLICY IF EXISTS "Allow all order items" ON order_items;

CREATE POLICY "Allow all order items" ON order_items
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin read customers" ON customers;
DROP POLICY IF EXISTS "Public insert customer" ON customers;
DROP POLICY IF EXISTS "Allow all customers" ON customers;

CREATE POLICY "Allow all customers" ON customers
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- ─── 3. PRODUCTS & VARIANTS & IMAGES (ADMIN MANAGE FIX) ─────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Admin full access products" ON products;
DROP POLICY IF EXISTS "Allow all products" ON products;

CREATE POLICY "Allow all products" ON products
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read product images" ON product_images;
DROP POLICY IF EXISTS "Admin write product images" ON product_images;
DROP POLICY IF EXISTS "Allow all product images" ON product_images;

CREATE POLICY "Allow all product images" ON product_images
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read variants" ON product_variants;
DROP POLICY IF EXISTS "Admin write variants" ON product_variants;
DROP POLICY IF EXISTS "Allow all product variants" ON product_variants;

CREATE POLICY "Allow all product variants" ON product_variants
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Admin write categories" ON categories;
DROP POLICY IF EXISTS "Allow all categories" ON categories;

CREATE POLICY "Allow all categories" ON categories
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active discounts" ON discounts;
DROP POLICY IF EXISTS "Admin manage discounts" ON discounts;
DROP POLICY IF EXISTS "Allow all discounts" ON discounts;

CREATE POLICY "Allow all discounts" ON discounts
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert message" ON contact_messages;
DROP POLICY IF EXISTS "Admin read messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow all messages" ON contact_messages;

CREATE POLICY "Allow all messages" ON contact_messages
  FOR ALL USING (TRUE) WITH CHECK (TRUE);


-- ─── 4. ADMIN USER FIX (401 UNAUTHORIZED FIX) ───────────────
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read own row" ON admins;
DROP POLICY IF EXISTS "Allow all admins" ON admins;

CREATE POLICY "Allow all admins" ON admins
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Tamam registered users ko admins table mein add karein
INSERT INTO admins (user_id, name, email, role)
SELECT id, COALESCE(raw_user_meta_data->>'name', 'Admin'), email, 'OWNER'
FROM auth.users
ON CONFLICT (email) DO NOTHING;

-- Trigger: koi bhi naya user bane toh automatic Admin ban jaye
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admins (user_id, name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Admin'), NEW.email, 'OWNER')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();
