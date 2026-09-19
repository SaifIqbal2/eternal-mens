-- ============================================================
-- ETERNAL MENS — DATABASE SCHEMA
-- ============================================================
-- Run this once in phpMyAdmin (or via the mysql command line) to
-- create the database and every table the site needs.
--
-- Categories are just rows in a table, not code — the owner adds
-- "Wallets", "Belts", etc. from the admin panel later with zero
-- code changes.
-- ============================================================

CREATE DATABASE IF NOT EXISTS eternal_mens_store
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE eternal_mens_store;

-- ----------------------------
-- ADMIN / AUTH
-- ----------------------------

CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('OWNER', 'STAFF') NOT NULL DEFAULT 'STAFF',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------
-- CATALOG
-- ----------------------------

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  section ENUM('watches', 'accessories') NOT NULL DEFAULT 'accessories',
  description TEXT,
  image VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  sku VARCHAR(60) NOT NULL UNIQUE,
  brand VARCHAR(100),
  category_id INT NOT NULL,

  description TEXT NOT NULL,
  specifications TEXT,          -- simple text or JSON string of key/value specs
  materials VARCHAR(255),
  dimensions VARCHAR(255),
  weight VARCHAR(100),

  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) NULL,
  cost_price DECIMAL(10,2) NULL,

  stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 5,
  allow_backorder TINYINT(1) NOT NULL DEFAULT 0,

  status ENUM('ACTIVE', 'DRAFT') NOT NULL DEFAULT 'DRAFT',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  is_bestseller TINYINT(1) NOT NULL DEFAULT 0,

  seo_title VARCHAR(255),
  seo_description VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_status (status),
  INDEX idx_category (category_id)
) ENGINE=InnoDB;

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- e.g. Color: Black / Silver / Gold — each with its own SKU, price, stock
CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,             -- e.g. "Black"
  option_type VARCHAR(50) NOT NULL DEFAULT 'Color',
  sku VARCHAR(60) NOT NULL UNIQUE,
  price_override DECIMAL(10,2) NULL,       -- NULL = use product price
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  order_id INT NULL,
  customer_id INT NULL,
  author_name VARCHAR(150) NOT NULL,
  rating TINYINT NOT NULL,                -- 1-5
  title VARCHAR(200),
  body TEXT NOT NULL,
  media_url VARCHAR(500) NULL,
  media_type ENUM('IMAGE', 'VIDEO') NULL,
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_order (order_id),
  UNIQUE KEY uq_review_product_order (product_id, order_id)
) ENGINE=InnoDB;

-- ----------------------------
-- CUSTOMERS
-- ----------------------------

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- ORDERS
-- ----------------------------

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,   -- e.g. ORD-1045

  customer_id INT NULL,

  -- snapshot fields so the order stays accurate even if the customer record changes later
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,

  shipping_line1 VARCHAR(255) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_postal VARCHAR(20),
  shipping_country VARCHAR(100) NOT NULL,

  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  discount_code VARCHAR(50),

  payment_method ENUM('COD', 'BANK_TRANSFER', 'ONLINE_GATEWAY') NOT NULL,
  payment_status ENUM('UNPAID', 'PAID', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'UNPAID',
  status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',

  -- guards against double-deducting / double-restoring stock
  stock_deducted TINYINT(1) NOT NULL DEFAULT 0,
  stock_restored TINYINT(1) NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id),
  INDEX idx_status (status),
  INDEX idx_email (customer_email)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT NULL,

  -- snapshot so historical orders stay accurate even if the product changes later
  product_name VARCHAR(200) NOT NULL,
  variant_name VARCHAR(100),
  sku VARCHAR(60) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id),
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ----------------------------
-- INVENTORY HISTORY
-- ----------------------------

CREATE TABLE inventory_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  variant_id INT NULL,

  previous_qty INT NOT NULL,
  change_qty INT NOT NULL,          -- signed: +20, -1
  new_qty INT NOT NULL,

  reason ENUM('STOCK_RECEIVED', 'MANUAL_ADJUSTMENT', 'ORDER_PLACED', 'ORDER_CANCELLED', 'ORDER_REFUNDED', 'INITIAL_STOCK') NOT NULL,
  order_id INT NULL,
  admin_id INT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_product (product_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ----------------------------
-- DISCOUNTS
-- ----------------------------

CREATE TABLE discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) NULL,
  usage_limit INT NULL,
  times_used INT NOT NULL DEFAULT 0,
  starts_at DATETIME NULL,
  expires_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- links a discount to specific products (leave empty = applies store-wide)
CREATE TABLE discount_products (
  discount_id INT NOT NULL,
  product_id INT NOT NULL,
  PRIMARY KEY (discount_id, product_id),
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- NEWSLETTER
-- ----------------------------

CREATE TABLE newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------
-- CONTACT MESSAGES
-- ----------------------------

CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
