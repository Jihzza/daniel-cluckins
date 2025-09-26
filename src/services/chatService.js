import { supabase } from "../lib/supabaseClient"; // or your central client path

function titleize(s) {
  if (!s) return "Conversation";
  const oneLine = s.replace(/\s+/g, " ").trim();
  const cap = oneLine.charAt(0).toUpperCase() + oneLine.slice(1);
  return cap.length > 40 ? cap.slice(0, 37).trimEnd() + "…" : cap;
}

/**
 * Returns an array of { session_id, title, last_at, message_count }
 */
export async function getConversationSummaries(userId) {
  const { data, error } = await supabase
    .from("chatbot_conversations")
    .select("session_id, user_id, role, content, created_at")
    .eq("user_id", userId)              // rely on RLS too
    .order("created_at", { ascending: true }); // oldest->newest

  if (error) throw error;

  const bySession = new Map();
  for (const row of data || []) {
    let g = bySession.get(row.session_id);
    if (!g) {
      g = {
        session_id: row.session_id,
        title_seed: null,
        last_at: row.created_at,
        message_count: 0,
      };
      bySession.set(row.session_id, g);
    }
    g.message_count += 1;
    g.last_at = row.created_at; // because sorted asc
    if (!g.title_seed && row.role === "user") {
      g.title_seed = row.content;
    }
  }

  const list = Array.from(bySession.values())
    .map(x => ({
      session_id: x.session_id,
      title: titleize(x.title_seed || "Conversation"),
      last_at: x.last_at,
      message_count: x.message_count,
    }))
    .sort((a, b) => new Date(b.last_at) - new Date(a.last_at)); // newest first

  return list;
}

export async function generateWelcomeForSession({
  sessionId,
  user,                 // { id, name, locale, ... }
  fetchHistory,         // (sessionId) => Promise<Message[]>
  systemPrompt,         // same string ChatbotPage uses
  model = 'gpt-4o-mini',
  temperature = 0.2,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone, // or your fixed one
}) {
  const history = await fetchHistory(sessionId);      // pull last N messages from DB
  const msgs = [
    { role: 'system', content: systemPrompt },
    // include a compact summary of history if you already do this on ChatbotPage
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: 'Start the conversation with a short, friendly welcome.' }
  ];

  return openaiService.chatCompletion({ model, temperature, messages: msgs });
}
