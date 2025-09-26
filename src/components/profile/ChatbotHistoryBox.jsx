// src/components/profile/ChatbotHistoryBox.jsx
import React from "react";
import { ChatBubbleLeftRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import ProfileDashboardBox from "./ProfileDashboardBox";
import { useTranslation } from "react-i18next";

export default function ChatbotHistoryBox({
  items = [],
  to = "/profile/chatbot-history",
  maxDisplay = 3,
}) {
  const { t, i18n } = useTranslation();

  const displayed = items.slice(0, maxDisplay);
  const hasMore = items.length > maxDisplay;

  const formatDate = (dateString) => {
    if (!dateString) return t("common.notAvailable");
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return t("common.notAvailable");

    // Prefer i18next Intl formatter if available, fall back to toLocaleDateString
    try {
      return t("common.dateShort", {
        val: d,
        formatParams: {
          val: { day: "2-digit", month: "2-digit", year: "numeric" },
        },
      });
    } catch {
      return d.toLocaleDateString(i18n.language || undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  return (
    <ProfileDashboardBox
      title={t("chatbotHistory.box.title")}
      to={to}
      clickable
      className="bg-black/10"
    >
      <div className="space-y-2">
        {displayed.length > 0 ? (
          displayed.map((row) => (
            <div
              key={row.session_id}
              className="w-full flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-300 shadow-sm"
              title={t("chatbotHistory.box.itemTooltip")}
            >
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-white/80" />
                <div>
                  <span className="text-sm font-medium text-white/90 block">
                    {row.title || t("chatbotHistory.box.untitled")}
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <ClockIcon className="h-3 w-3 text-white/60" />
                    <span className="text-xs text-white/70">
                      {formatDate(row.last_at)}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-xs text-white/70">
                {t("chatbotHistory.box.message", {
                  count: row.message_count ?? 0,
                })}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/70">
              {t("chatbotHistory.box.empty")}
            </p>
          </div>
        )}

        {hasMore && (
          <div className="text-center pt-2">
            <span className="text-xs text-white/60">
              {t("chatbotHistory.box.moreConversations", {
                count: items.length - maxDisplay,
              })}
            </span>
          </div>
        )}
      </div>
    </ProfileDashboardBox>
  );
}
