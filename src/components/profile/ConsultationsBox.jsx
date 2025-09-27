// src/components/profile/ConsultationsBox.jsx
import React from 'react';
import { useTranslation } from 'react-i18next'; // or from 'next-i18next' if that's your setup
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ProfileDashboardBox from './ProfileDashboardBox';

const ConsultationsBox = ({
  consultations = [],
  to = '/profile/appointments',
  maxDisplay = 3,
  currency = 'EUR'
}) => {
  const { t, i18n } = useTranslation();

  const formatCurrency = (amount = 0) => {
    const locale = i18n.resolvedLanguage || i18n.language || undefined;
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2
      }).format(amount);
    } catch {
      // Fallback if Intl formatter fails
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return t('common.notAvailable');

    if (minutes < 60) {
      return t('consultations.box.duration.minutes', { count: minutes });
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    if (remaining > 0) {
      // e.g. "1h 30min" (both parts localized)
      return t('consultations.box.duration.hoursAndMinutes', {
        hours,
        minutes: remaining
      });
    }
    // e.g. "2h"
    return t('consultations.box.duration.hoursOnly', { count: hours });
  };

  const displayed = consultations.slice(0, maxDisplay);
  const hasMore = consultations.length > maxDisplay;

  return (
    <ProfileDashboardBox
      title={t('consultations.box.title')}
      to={to}
      className="bg-black/10"
    >
      <div className="space-y-2">
        {displayed.length > 0 ? (
          displayed.map((c, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/20 shadow-sm">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-4 w-4 text-white/80" />
                <span className="text-sm font-medium text-white/90">
                  {formatDuration(c.duration)}
                </span>
                <span className="text-xs text-white/60">•</span>
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4 text-white/80" />
                  <span className="text-xs text-white/80 font-medium">
                    {c.status ? t(`consultations.box.status.${c.status}`, c.status) : t('consultations.box.status.confirmed')}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-white">
                {formatCurrency(c.price)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <ClockIcon className="h-8 w-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/70">
              {t('consultations.box.empty')}
            </p>
          </div>
        )}

        {hasMore && (
          <div className="text-center pt-2">
            <span className="text-xs text-white/60">
              {t('consultations.box.more', { count: consultations.length - maxDisplay })}
            </span>
          </div>
        )}
      </div>
    </ProfileDashboardBox>
  );
};

export default ConsultationsBox;
