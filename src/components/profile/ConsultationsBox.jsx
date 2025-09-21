// src/components/profile/ConsultationsBox.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ProfileDashboardBox from './ProfileDashboardBox';

/**
 * Consultations section box showing recent appointments
 * Based on the image showing consultation entries with duration, status, and price
 */
const ConsultationsBox = ({ 
  consultations = [], 
  to = '/profile/appointments',
  maxDisplay = 3 
}) => {
  const { t } = useTranslation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const displayedConsultations = consultations.slice(0, maxDisplay);
  const hasMore = consultations.length > maxDisplay;

  return (
    <ProfileDashboardBox 
      title="Consultations" 
      to={to}
      className="bg-black/10"
    >
      <div className="space-y-2">
        {displayedConsultations.length > 0 ? (
          displayedConsultations.map((consultation, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
              <div className="flex items-center space-x-3">
                <ClockIcon className="h-4 w-4 text-white/80" />
                <span className="text-sm font-medium text-white/90">
                  {formatDuration(consultation.duration)}
                </span>
                <span className="text-xs text-white/60">•</span>
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4 text-white/80" />
                  <span className="text-xs text-white/80 font-medium">
                    {consultation.status || 'Confirmed'}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-white">
                {formatCurrency(consultation.price || 0)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <ClockIcon className="h-8 w-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/70">No consultations yet</p>
          </div>
        )}
        
        {hasMore && (
          <div className="text-center pt-2">
            <span className="text-xs text-white/60">
              +{consultations.length - maxDisplay} more consultations
            </span>
          </div>
        )}
      </div>
    </ProfileDashboardBox>
  );
};

export default ConsultationsBox;
