// pages/profile/ChatbotHistoryPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 👇 Fix this import path per section 2 below
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";

function titleize(s) {
  if (!s) return "Conversation";
  const oneLine = s.replace(/\s+/g, " ").trim();
  const cap = oneLine.charAt(0).toUpperCase() + oneLine.slice(1);
  return cap.length > 40 ? cap.slice(0, 37).trimEnd() + "…" : cap;
}

export default function ChatbotHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("chatbot_conversations")
        .select("session_id, user_id, role, content, created_at")
        .eq("user_id", user.id)                // rely on RLS too
        .order("created_at", { ascending: true }); // oldest first

      if (error) {
        console.error(error);
        setItems([]);
        setLoading(false);
        return;
      }

      // Group by session_id
      const bySession = new Map();
      for (const row of data || []) {
        let g = bySession.get(row.session_id);
        if (!g) {
          g = {
            session_id: row.session_id,
            user_id: row.user_id,
            title_seed: null,
            first_at: row.created_at,
            last_at: row.created_at,
            message_count: 0,
          };
          bySession.set(row.session_id, g);
        }
        g.message_count += 1;
        g.last_at = row.created_at; // because list is oldest->newest
        if (!g.title_seed && row.role === "user") {
          g.title_seed = row.content;
        }
      }

      const list = Array.from(bySession.values())
        .map(x => ({
          ...x,
          title: titleize(x.title_seed || "Conversation"),
        }))
        .sort((a, b) => new Date(b.last_at) - new Date(a.last_at)); // newest first

      if (!ignore) setItems(list);
      setLoading(false);
    }
    load();
    return () => { ignore = true; };
  }, [user?.id]);

  if (loading) return <div className="p-4">Loading conversations…</div>;

  if (!items.length) {
    return (
      <div className="p-4">
        <p>No conversations yet.</p>
        <button className="mt-3 underline" onClick={() => navigate("/chat")}>
          Start a new chat
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-2">
      {items.map(item => (
        <button
          key={item.session_id}
          onClick={() => navigate(`/chat?session_id=${encodeURIComponent(item.session_id)}`)}
          className="text-left p-3 rounded-md border hover:bg-gray-50"
        >
          <div className="font-medium">{item.title}</div>
          <div className="text-xs opacity-70">
            {new Date(item.last_at).toLocaleString()} • {item.message_count} messages
          </div>
        </button>
      ))}
    </div>
  );
}