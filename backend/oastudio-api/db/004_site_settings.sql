-- Editable site content (landing page sections, texts, images), one JSON document per key.
-- Run once against oastudio_db before starting the API (ddl-auto=validate).
CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    content     TEXT        NOT NULL,
    updated_at  TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);
