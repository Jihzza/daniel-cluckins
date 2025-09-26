// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SESSION_STORAGE_KEY = 'chatbot-session-id';

// Helper: read the current session-id from sessionStorage (if any)
function getSessionId() {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

// Factory: build a client with a specific x-session-id header
function buildClient(sessionId) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    // Attach custom headers to **all** PostgREST requests
    // You can read these in RLS with current_setting('request.headers', true)
    global: {
      headers: {
        'x-session-id': sessionId || '',
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

// Create the initial client with whatever session-id exists now
let supabase = buildClient(getSessionId());

// Public API:
// 1) the live client (import { supabase } from '...')
// 2) a setter to update the header + rebuild client when the chat session changes
export { supabase };

/**
 * Update the x-session-id used by the client and rebuild it so future requests
 * carry the new header. Call this right after you generate a new conversation id.
 *
 * Example:
 *   const newId = crypto.randomUUID();
 *   setSupabaseSessionHeader(newId);
 */
export function setSupabaseSessionHeader(newSessionId) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId || '');
  } catch {
    // ignore storage failures (private mode, etc.)
  }
  supabase = buildClient(newSessionId || '');
}
