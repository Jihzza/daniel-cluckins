// src/pages/profile/ChatbotHistoryPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

import { supabase } from "../../lib/supabaseClient";
import ProfileSectionLayout from "../../components/profile/ProfileSectionLayout";
import SectionTextWhite from "../../components/common/SectionTextWhite";

import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

/** Helpers */
function titleize(s) {
  if (!s) return "Conversation";
  const oneLine = s.replace(/\s+/g, " ").trim();
  const cap = oneLine.charAt(0).toUpperCase() + oneLine.slice(1);
  return cap.length > 40 ? cap.slice(0, 37).trimEnd() + "…" : cap;
}
function formatDateTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "N/A";
  }
}

export default function ChatbotHistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("chatbot_conversations")
        .select("session_id, user_id, role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }); // oldest first

      if (error) {
        console.error("History load error:", error);
        if (!ignore) setItems([]);
        setLoading(false);
        return;
      }

      // Group rows by session_id; derive title from first user message
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
        g.last_at = row.created_at; // ascending, so latest seen is last
        if (!g.title_seed && row.role === "user") {
          g.title_seed = row.content;
        }
      }

      const list = Array.from(bySession.values())
        .map((x) => ({
          ...x,
          title: titleize(x.title_seed || "Conversation"),
        }))
        .sort((a, b) => new Date(b.last_at) - new Date(a.last_at)); // newest first

      if (!ignore) setItems(list);
      setLoading(false);
    };

    load();
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  // Local search filter (title only for now)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((i) => i.title.toLowerCase().includes(term));
  }, [items, q]);

  /** Skeleton row (matches subtle card style used elsewhere) */
  const SkeletonRow = () => (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-full bg-white/20" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-44 rounded bg-white/20" />
          <div className="h-2 w-32 rounded bg-white/10" />
        </div>
        <div className="h-3 w-16 rounded bg-white/10" />
      </div>
    </div>
  );

  return (
    <div className="bg-[#002147] min-h-full">
      {/* Same container + header pattern as other profile pages */}
      <ProfileSectionLayout>
        {/* Header */}
        <SectionTextWhite title={t("chatbotHistory.title", "Chatbot History")} />

        {/* Search toolbar */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-sm">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("chatbotHistory.search", "Search conversations…")}
              className="w-full rounded-xl bg-white/10 px-10 py-2.5 text-white placeholder-white/60 ring-1 ring-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={t("chatbotHistory.searchAria", "Search conversations")}
            />
          </div>
          <div className="text-sm text-white/70">
            {filtered.length} / {items.length} {t("chatbotHistory.count", "conversations")}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <ChatBubbleLeftRightIcon className="mx-auto mb-3 h-10 w-10 text-white/40" />
            <p className="mb-1 font-medium text-white/90">
              {t("chatbotHistory.emptyTitle", "No conversations found")}
            </p>
            <p className="mb-4 text-sm text-white/70">
              {t("chatbotHistory.emptySubtitle", "Try a different search or start a new chat.")}
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2 ring-1 ring-white/15 transition hover:bg-white/15"
            >
              {t("chatbotHistory.startNew", "Start a new chat")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <button
                key={item.session_id}
                onClick={() =>
                  navigate(`/chat?session_id=${encodeURIComponent(item.session_id)}`)
                }
                className="text-left rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 hover:border-white/20"
                title={t("chatbotHistory.open", "Open conversation")}
                aria-label={`${t("chatbotHistory.open", "Open conversation")}: ${item.title}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-white/80" />
                    </div>
                    <div>
                      <div className="text-base font-medium text-white">{item.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>{formatDateTime(item.last_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-white/70">
                    {item.message_count} {t("chatbotHistory.messages", "messages")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ProfileSectionLayout>
    </div>
  );
}
