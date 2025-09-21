-- Fix pitch_requests table phone column constraint
-- Run this in your Supabase SQL editor

-- First, let's check if the phone column has a NOT NULL constraint
-- If it does, we need to make it nullable

-- Make phone column nullable (if it's currently NOT NULL)
ALTER TABLE pitch_requests ALTER COLUMN phone DROP NOT NULL;

-- Also ensure other optional columns are nullable
ALTER TABLE pitch_requests ALTER COLUMN name DROP NOT NULL;
ALTER TABLE pitch_requests ALTER COLUMN email DROP NOT NULL;
ALTER TABLE pitch_requests ALTER COLUMN role DROP NOT NULL;

-- Verify the table structure
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'pitch_requests' 
ORDER BY ordinal_position;
