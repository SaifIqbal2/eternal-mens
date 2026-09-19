-- Reviews moderation
-- New customer reviews are hidden until an admin approves them.
USE eternal_mens_store;

ALTER TABLE reviews
    MODIFY is_approved TINYINT(1) NOT NULL DEFAULT 0;
