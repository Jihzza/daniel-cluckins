// src/components/notifications/NotificationsBell.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationsContext';
import NotificationIcon from '../../assets/icons/Notifications White.svg';
import { useTranslation } from 'react-i18next'; // 1. Import hook

export default function NotificationsBell() {
    const { t } = useTranslation(); // 2. Initialize hook
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = () => {
        const notificationsPath = '/notifications';
        if (location.pathname === notificationsPath) {
            navigate(-1);
        } else {
            navigate(notificationsPath);
        }
    };

    const isActive = location.pathname.startsWith('/notifications');

    return (
        <div className="relative  cursor-pointer">
            <button
                onClick={handleClick}
                className="relative flex items-center text-white rounded-full cursor-pointer"
                // 3. Use translated aria-label with interpolation
                aria-label={t('notifications.bellAriaLabel', { count: unreadCount })}
            >
                {/* 4. Use translated alt text */}
                <img src={NotificationIcon} alt={t('notifications.bellIconAlt')} className={`h-5 w-5 md:h-7 md:w-7  ${isActive ? 'text-yellow-400' : 'text-white'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-5 w-5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-black ">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}