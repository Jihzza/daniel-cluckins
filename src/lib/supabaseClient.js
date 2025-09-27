// supabaseClient.js (supabase-js v2)
import { createClient } from '@supabase/supabase-js'

const SESSION_ID_KEY = 'chatbot-session-id'
const existing = sessionStorage.getItem(SESSION_ID_KEY)
const sessionId = existing || (crypto.randomUUID(), sessionStorage.setItem(SESSION_ID_KEY, crypto.randomUUID()), sessionStorage.getItem(SESSION_ID_KEY))

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        'x-session-id': sessionId,  // <- must match the header used in RLS
      },
    },
  }
)
