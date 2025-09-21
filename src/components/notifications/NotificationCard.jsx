// src/components/notifications/NotificationCard.jsx
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

const NotificationMessage = ({ notification }) => {
  const { t } = useTranslation();

  switch (notification.type) {
    case 'new_message':
      return (
        <Trans
          i18nKey="notifications.types.newMessage"
          values={{ sender: notification.data?.sender_username }}
          components={[<span className="font-semibold text-white" />]}
        />
      );
    case 'consultation_reminder':
      return (
        <Trans
          i18nKey="notifications.types.consultationReminder"
          values={{ time: notification.data?.consultation_time }}
          components={[<span className="font-semibold text-white" />]}
        />
      );
    case 'new_consultation_booking':
      return (
        <Trans
          i18nKey="notifications.types.newConsultationBooking"
          components={[<span className="font-semibold text-white" />]}
        />
      );
    // Explicit app types
    case 'user_signup':
    case 'admin_alert':
    case 'subscription_started':
    case 'subscription_expiring':
    case 'pitch_request_submitted':
    case 'pitch_request_status':
      return <span className="text-white">{notification.message || notification.title}</span>;
    default:
      return <span className="text-white">{notification.message || notification.title || t('notifications.types.default')}</span>;
  }
};

// Simple status dot indicator for notifications
const NotificationDot = ({ isRead }) => {
  const colorClass = isRead ? 'bg-[#ECEBE5]' : 'bg-[#bfa200]';
  return (
    <div className={`w-2 h-2 ${colorClass} rounded-full flex-shrink-0 mt-1`}></div>
  );
};

export default function NotificationCard({ notification, onMarkAsRead }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.is_read) onMarkAsRead(notification.id);
    if (notification.type === 'new_message' && notification.data?.conversation_id) {
      navigate(`/messages/${notification.data.conversation_id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${notification.is_read ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start space-x-3">
        {/* White dot indicator */}
        <div className="flex-shrink-0">
          <NotificationDot isRead={!!notification.is_read} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-100 leading-5">
                <NotificationMessage notification={notification} />
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
            
            {/* Unread indicator */}
            {!notification.is_read && (
              <div className="flex-shrink-0 ml-2 mt-1">
                <span 
                  className="w-2 h-2 bg-red-500 rounded-full block" 
                  aria-label={t('notifications.unreadAriaLabel')} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
