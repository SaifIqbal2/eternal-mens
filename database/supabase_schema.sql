-- ============================================================
-- ETERNAL MENS — SUPABASE (PostgreSQL) SCHEMA
-- ============================================================
-- Yeh file Supabase SQL Editor mein paste kar ke RUN karein.
-- Steps:
--   1. supabase.com → apna project open karein
--   2. Left sidebar → SQL Editor
--   3. Yeh poora code paste karein
--   4. "Run" button press karein
-- ============================================================


-- ============================================================
-- HELPER: updated_at auto-update trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- ADMINS (Supabase Auth ke saath linked)
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'STAFF' CHECK (role IN ('OWNER', 'STAFF')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read own row" ON admins
  FOR SELECT USING (auth.uid() = user_id);


-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  section     TEXT NOT NULL DEFAULT 'accessories' CHECK (section IN ('watches', 'accessories')),
  description TEXT,
  image       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin write categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  sku                 TEXT NOT NULL UNIQUE,
  brand               TEXT,
  category_id         BIGINT NOT NULL REFERENCES categories(id),

  description         TEXT NOT NULL,
  specifications      TEXT,
  materials           TEXT,
  dimensions          TEXT,
  weight              TEXT,

  price               NUMERIC(10,2) NOT NULL,
  compare_at_price    NUMERIC(10,2),
  cost_price          NUMERIC(10,2),

  stock               INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  allow_backorder     BOOLEAN NOT NULL DEFAULT FALSE,

  status              TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('ACTIVE', 'DRAFT')),
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  is_bestseller       BOOLEAN NOT NULL DEFAULT FALSE,

  seo_title           TEXT,
  seo_description     TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_status   ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug     ON products(slug);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Admin full access products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read product images" ON product_images
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin write product images" ON product_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  option_type     TEXT NOT NULL DEFAULT 'Color',
  sku             TEXT NOT NULL UNIQUE,
  price_override  NUMERIC(10,2),
  stock           INT NOT NULL DEFAULT 0,
  image           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read variants" ON product_variants
  FOR SELECT USING (TRUE);
CREATE POLICY "Admin write variants" ON product_variants
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id           BIGSERIAL PRIMARY KEY,
  product_id   BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id     BIGINT,
  customer_id  BIGINT,
  author_name  TEXT NOT NULL,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        TEXT,
  body         TEXT NOT NULL,
  media_url    TEXT,
  media_type   TEXT CHECK (media_type IN ('IMAGE', 'VIDEO')),
  is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved reviews" ON reviews
  FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Anyone can insert review" ON reviews
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read customers" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );
CREATE POLICY "Public insert customer" ON customers
  FOR INSERT WITH CHECK (TRUE);


-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                BIGSERIAL PRIMARY KEY,
  order_number      TEXT NOT NULL UNIQUE,

  customer_id       BIGINT REFERENCES customers(id),
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT NOT NULL,

  shipping_line1    TEXT NOT NULL,
  shipping_city     TEXT NOT NULL,
  shipping_postal   TEXT,
  shipping_country  TEXT NOT NULL DEFAULT 'Pakistan',

  subtotal          NUMERIC(10,2) NOT NULL,
  shipping_cost     NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total             NUMERIC(10,2) NOT NULL,
  discount_code     TEXT,

  payment_method    TEXT NOT NULL CHECK (payment_method IN ('COD', 'BANK_TRANSFER', 'ONLINE_GATEWAY')),
  payment_status    TEXT NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID', 'REFUNDED', 'FAILED')),
  status            TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED')),

  stock_deducted    BOOLEAN NOT NULL DEFAULT FALSE,
  stock_restored    BOOLEAN NOT NULL DEFAULT FALSE,
  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email   ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert order" ON orders
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    BIGINT NOT NULL REFERENCES products(id),
  variant_id    BIGINT REFERENCES product_variants(id),

  product_name  TEXT NOT NULL,
  variant_name  TEXT,
  sku           TEXT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL,
  quantity      INT NOT NULL,
  line_total    NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert order items" ON order_items
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manage order items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- INVENTORY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_logs (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id    BIGINT REFERENCES product_variants(id) ON DELETE CASCADE,

  previous_qty  INT NOT NULL,
  change_qty    INT NOT NULL,
  new_qty       INT NOT NULL,

  reason        TEXT NOT NULL CHECK (reason IN (
    'STOCK_RECEIVED','MANUAL_ADJUSTMENT','ORDER_PLACED',
    'ORDER_CANCELLED','ORDER_REFUNDED','INITIAL_STOCK'
  )),
  order_id      BIGINT,
  admin_id      BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inv_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_logs_created ON inventory_logs(created_at DESC);

ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage inventory" ON inventory_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- DISCOUNTS
-- ============================================================
CREATE TABLE IF NOT EXISTS discounts (
  id               BIGSERIAL PRIMARY KEY,
  code             TEXT NOT NULL UNIQUE,
  type             TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
  value            NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2),
  usage_limit      INT,
  times_used       INT NOT NULL DEFAULT 0,
  starts_at        TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active discounts" ON discounts
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin manage discounts" ON discounts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- DISCOUNT PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS discount_products (
  discount_id  BIGINT NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  product_id   BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (discount_id, product_id)
);

ALTER TABLE discount_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage discount_products" ON discount_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public subscribe newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin read newsletter" ON newsletter_subscribers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- CONTACT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert message" ON contact_messages
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin read messages" ON contact_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
  );


-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO categories (name, slug, section, is_active, sort_order) VALUES
  ('Analog',      'analog-watches',      'watches',     TRUE, 0),
  ('Chronograph', 'chronograph-watches', 'watches',     TRUE, 1),
  ('Diver',       'diver-watches',       'watches',     TRUE, 2),
  ('Dress',       'dress-watches',       'watches',     TRUE, 3),
  ('Smart Watch', 'smart-watches',       'watches',     TRUE, 4),
  ('Sunglasses',  'sunglasses',          'accessories', FALSE, 5),
  ('Bracelets',   'bracelets',           'accessories', FALSE, 6),
  ('Rings',       'rings',               'accessories', FALSE, 7),
  ('Chains',      'chains',              'accessories', FALSE, 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO discounts (code, type, value, is_active) VALUES
  ('WELCOME10', 'PERCENTAGE', 10, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- STORAGE: Supabase Dashboard > Storage > Create Bucket
--   Name: product-images
--   Public bucket: YES
-- ============================================================
