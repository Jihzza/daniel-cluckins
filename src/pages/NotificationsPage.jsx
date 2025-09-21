// src/pages/NotificationsPage.jsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileSectionLayout from '../components/profile/ProfileSectionLayout';
import SectionTextWhite from '../components/common/SectionTextWhite';
import { useNotifications } from '../contexts/NotificationsContext';
import NotificationCard from '../components/notifications/NotificationCard';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  // Auto-mark all notifications as read when entering the page
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const hasUnreadNotifications = notifications.some(n => !n.is_read);
      if (hasUnreadNotifications) {
        markAllAsRead();
      }
    }
  }, [notifications, markAllAsRead]);

  const renderContent = () => {
    if (loading) {
      return <div className="px-4 py-6 text-sm text-gray-300">{t('notifications.loading')}</div>;
    }
    if (!notifications || notifications.length === 0) {
      return <div className="px-4 py-6 text-sm text-gray-300">{t('notifications.noNotifications')}</div>;
    }
    return (
      <div className="divide-y divide-white/10">
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} onMarkAsRead={markAsRead} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#002147] h-auto min-h-full">
      <ProfileSectionLayout>
        <div>
          <SectionTextWhite title={t('notifications.pageTitle')} />
        </div>
        {renderContent()}
      </ProfileSectionLayout>
    </div>
  );
}
