// src/components/notifications/NotificationsPanel.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import NotificationCard from './NotificationCard';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function NotificationsPanel({ onClose }) {
  const { t } = useTranslation();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="w-full max-w-md bg-[#0B1B2B] text-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-base font-semibold">{t('notifications.panel.title')}</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-medium px-3 py-1 rounded-full bg-black/10 hover:bg-white/20 transition"
          >
            {t('notifications.panel.markAllAsRead')}
          </button>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-sm text-gray-300">{t('notifications.panel.loading')}</div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-300">{t('notifications.panel.noNotifications')}</div>
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              onMarkAsRead={markAsRead}
              onClose={onClose}
            />
          ))
        )}
      </div>
    </div>
  );
}
