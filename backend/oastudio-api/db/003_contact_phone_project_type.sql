-- Optional phone number and project type on contact messages (contact form).
-- Run once against oastudio_db before starting the API (ddl-auto=validate).
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(30);
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS project_type VARCHAR(100);
