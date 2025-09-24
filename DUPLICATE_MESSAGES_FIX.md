# Fix for Duplicate Messages in Chatbot

This document explains the duplicate message issue and provides the complete solution.

## Problem

Duplicate chatbot messages were being created due to:

1. **React StrictMode re-execution**: Database inserts placed inside React state updaters (`setMessages`) were being executed multiple times in development due to StrictMode's intentional re-running of effects and render work.

2. **Lack of database-level uniqueness constraints**: No protection against duplicate inserts at the database level.

## Solution Overview

### 1. Code Changes ✅ (COMPLETED)

**Fixed in `src/pages/ChatbotPage.jsx`**:

- **Moved database inserts OUT of React state updaters** to prevent StrictMode re-execution
- **Added idempotency key generation** using a hash of `(sessionId, role, content, isWelcome)`
- **Implemented upsert with conflict resolution** instead of plain inserts
- **Separated UI updates from database operations** for cleaner architecture

### 2. Database Migration 🔄 (REQUIRED)

**Run the SQL migration** to add database-level duplicate prevention:

```sql
-- See add-message-key-to-chatbot-conversations.sql
```

## How to Apply the Database Migration

### Option 1: Supabase Dashboard (Recommended)

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Go to your project → SQL Editor
3. Copy and paste the contents of `add-message-key-to-chatbot-conversations.sql`
4. Click "Run" to execute the migration

### Option 2: Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## What the Migration Does

1. **Adds `message_key` column** - Stores the idempotency key for each message
2. **Backfills existing messages** - Generates keys for existing rows to prevent conflicts
3. **Creates unique constraint** - Prevents duplicate messages at database level
4. **Adds performance indexes** - Optimizes common query patterns
5. **Sets up Row Level Security** - Ensures proper access control

## Key Improvements

### Before (Problematic)
```javascript
setMessages((prev) => {
  const newMessages = [...prev, { role: 'user', content }];
  // ❌ Side effect inside state updater - can run multiple times!
  (async () => {
    await supabase.from('chatbot_conversations').insert({...});
  })();
  return newMessages;
});
```

### After (Fixed)
```javascript
// ✅ 1) Pure UI update
setMessages((prev) => [...prev, { role: 'user', content }]);

// ✅ 2) Side effect outside updater - runs only once
await storeMessage(sessionId, 'user', content, false);
```

## Testing the Fix

After applying both code changes and database migration:

1. **Development mode**: Messages should no longer duplicate even with React StrictMode
2. **Network retries**: Database will reject actual duplicates gracefully
3. **Race conditions**: Upsert with `ignoreDuplicates: true` handles concurrent requests
4. **Welcome messages**: Single-sourced creation with same duplicate protection

## Verification

To verify the fix is working:

```sql
-- Check for any duplicate messages (should return 0 rows)
SELECT message_key, COUNT(*) as count
FROM chatbot_conversations 
GROUP BY message_key 
HAVING COUNT(*) > 1;

-- Check that message_key column exists and has unique constraint
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'chatbot_conversations'::regclass 
AND conname = 'chatbot_conversations_message_key_unique';
```

## Performance Impact

- **Positive**: Fewer unnecessary database writes
- **Minimal overhead**: Simple hash function for idempotency keys
- **Better UX**: No duplicate messages cluttering the conversation
- **Indexed queries**: Fast duplicate checking with database indexes

## Future Considerations

- Consider using `crypto.subtle.digest()` for production-grade hashing (currently using simple hash for compatibility)
- Monitor `message_key` uniqueness in production logs
- Could extend this pattern to other user-generated content tables
