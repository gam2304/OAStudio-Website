-- Allow the SUPER_ADMIN role and promote the original (bootstrap) admin to it.
-- Run once against oastudio_db before starting the API with this change.
BEGIN;

ALTER TABLE admins DROP CONSTRAINT IF EXISTS admins_role_check;
ALTER TABLE admins ADD CONSTRAINT admins_role_check
    CHECK (role IN ('ADMIN', 'SUPER_ADMIN'));

-- The oldest admin is the main admin created by AdminBootstrap.
UPDATE admins SET role = 'SUPER_ADMIN'
WHERE id = (SELECT MIN(id) FROM admins)
  AND NOT EXISTS (SELECT 1 FROM admins WHERE role = 'SUPER_ADMIN');

COMMIT;
