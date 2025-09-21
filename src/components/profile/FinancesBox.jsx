// src/components/profile/FinancesBox.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CurrencyEuroIcon } from '@heroicons/react/24/outline';
import ProfileDashboardBox from './ProfileDashboardBox';

/**
 * Finances section box showing financial metrics
 * Based on the image showing consultation earnings, coaching revenue, and pitch deck requests
 */
const FinancesBox = ({ 
  consultationEarnings = 0, 
  coachingRevenue = 0, 
  pitchDeckEarnings = 0,
  to = '/profile/finances' 
}) => {
  const { t } = useTranslation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <ProfileDashboardBox 
      title="Finances" 
      to={to}
      className="bg-black/10"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
          <div className="flex items-center space-x-2">
            <CurrencyEuroIcon className="h-5 w-5 text-white/80" />
            <span className="text-sm font-medium text-white/90">Consultations (Lifetime)</span>
          </div>
          <span className="text-lg font-bold text-white">
            {formatCurrency(consultationEarnings)}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
          <div className="flex items-center space-x-2">
            <CurrencyEuroIcon className="h-5 w-5 text-white/80" />
            <span className="text-sm font-medium text-white/90">Coaching (Monthly)</span>
          </div>
          <span className="text-lg font-bold text-white">
            {formatCurrency(coachingRevenue)}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
          <div className="flex items-center space-x-2">
            <CurrencyEuroIcon className="h-5 w-5 text-white/80" />
            <span className="text-sm font-medium text-white/90">Pitch Decks (Free)</span>
          </div>
          <span className="text-lg font-bold text-white">
            {formatCurrency(pitchDeckEarnings)}
          </span>
        </div>
      </div>
    </ProfileDashboardBox>
  );
};

export default FinancesBox;
