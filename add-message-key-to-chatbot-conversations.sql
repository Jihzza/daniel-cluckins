-- Migration: Add message_key column and unique constraint to chatbot_conversations
-- Run this in your Supabase SQL editor
-- This prevents duplicate messages at the database level

-- 1. Add the message_key column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='chatbot_conversations' AND column_name='message_key') THEN
        ALTER TABLE chatbot_conversations ADD COLUMN message_key TEXT;
    END IF;
END $$;

-- 2. Backfill existing rows with message keys
-- This generates keys for existing messages to prevent conflicts
UPDATE chatbot_conversations 
SET message_key = md5(session_id || ':' || role || ':' || content || ':' || COALESCE(is_welcome::text, 'false'))
WHERE message_key IS NULL;

-- 3. Make message_key NOT NULL (after backfill)
ALTER TABLE chatbot_conversations ALTER COLUMN message_key SET NOT NULL;

-- 4. Create unique constraint on message_key
-- This prevents duplicate messages with the same content
ALTER TABLE chatbot_conversations 
ADD CONSTRAINT chatbot_conversations_message_key_unique 
UNIQUE (message_key);

-- 5. Add index for better performance on message_key lookups
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_message_key 
ON chatbot_conversations(message_key);

-- 6. Optional: Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_role 
ON chatbot_conversations(session_id, role);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_welcome 
ON chatbot_conversations(session_id, is_welcome) 
WHERE is_welcome = true;

-- 7. Ensure the table exists with proper structure (in case it doesn't)
-- This is a safety check - adjust column types as needed based on your current schema
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_key TEXT NOT NULL,
  is_welcome BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security if not already enabled
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policy for authenticated users to access their own messages
-- Adjust this policy based on your security requirements
DROP POLICY IF EXISTS "Users can access their own chatbot messages" ON chatbot_conversations;
CREATE POLICY "Users can access their own chatbot messages" 
ON chatbot_conversations FOR ALL 
USING (
  auth.uid() = user_id 
  OR user_id IS NULL -- Allow access to messages without user_id (anonymous sessions)
);

COMMENT ON COLUMN chatbot_conversations.message_key IS 'Unique identifier for each message to prevent duplicates';
COMMENT ON INDEX idx_chatbot_conversations_message_key IS 'Index for fast duplicate checking';
COMMENT ON CONSTRAINT chatbot_conversations_message_key_unique IS 'Prevents duplicate messages';
