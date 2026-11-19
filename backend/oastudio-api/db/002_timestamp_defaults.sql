-- Rows created before the entities used @CreationTimestamp/@UpdateTimestamp have NULL timestamps.
-- Backfill them and add DB defaults so raw SQL inserts (seed scripts) get a value too.
-- Run once against oastudio_db.
BEGIN;

UPDATE categories       SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE project_images   SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE contact_messages SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE projects         SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE projects         SET updated_at = created_at        WHERE updated_at IS NULL;

ALTER TABLE categories       ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE project_images   ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE contact_messages ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE projects         ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE projects         ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;

COMMIT;
