-- Review verification + customer media
-- Run this once on an existing ETERNAL MENS database.

USE eternal_mens_store;

ALTER TABLE reviews
  ADD COLUMN order_id INT NULL AFTER product_id,
  ADD COLUMN media_url VARCHAR(500) NULL AFTER body,
  ADD COLUMN media_type ENUM('IMAGE', 'VIDEO') NULL AFTER media_url,
  ADD INDEX idx_order (order_id),
  ADD CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

ALTER TABLE reviews
  ADD UNIQUE KEY uq_review_product_order (product_id, order_id);
