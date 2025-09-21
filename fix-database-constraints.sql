-- Fix database constraints for MCP integration
-- Run this in your Supabase SQL editor

-- 1. Fix pitch_requests table - make phone column nullable
ALTER TABLE pitch_requests ALTER COLUMN phone DROP NOT NULL;

-- 2. Make other optional columns nullable if they aren't already
ALTER TABLE pitch_requests ALTER COLUMN name DROP NOT NULL;
ALTER TABLE pitch_requests ALTER COLUMN email DROP NOT NULL;
ALTER TABLE pitch_requests ALTER COLUMN role DROP NOT NULL;

-- 3. Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pitch_requests' 
ORDER BY ordinal_position;

-- 4. Test insert to verify it works
INSERT INTO pitch_requests (project, user_id, name, email, phone, role, status)
VALUES ('GalowClub', 'test-user-id', 'Test User', 'test@example.com', NULL, NULL, 'submitted');

-- 5. Clean up test data
DELETE FROM pitch_requests WHERE user_id = 'test-user-id';
