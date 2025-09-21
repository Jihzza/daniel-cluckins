// src/components/profile/SubscriptionsBox.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import ProfileDashboardBox from './ProfileDashboardBox';

/**
 * Subscriptions section box showing active subscriptions
 */
const SubscriptionsBox = ({ 
  subscriptions = [], 
  to = '/profile/subscriptions',
  maxDisplay = 2 
}) => {
  const { t } = useTranslation();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const displayedSubscriptions = subscriptions.slice(0, maxDisplay);
  const hasMore = subscriptions.length > maxDisplay;

  return (
    <ProfileDashboardBox 
      title="Subscriptions" 
      to={to}
      className="bg-black/10"
    >
      <div className="space-y-2">
        {displayedSubscriptions.length > 0 ? (
          displayedSubscriptions.map((subscription, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="h-4 w-4 text-white/80" />
                <span className="text-sm font-medium text-white/90">
                  {subscription.planName || 'Subscription'}
                </span>
                <div className="flex items-center space-x-1">
                  <CheckCircleIcon className="h-4 w-4 text-white/80" />
                  <span className="text-xs text-white/80 font-medium">
                    {subscription.status || 'Active'}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-white">
                {formatCurrency(subscription.price || 0)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <CreditCardIcon className="h-8 w-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/70">No active subscriptions</p>
          </div>
        )}
        
        {hasMore && (
          <div className="text-center pt-2">
            <span className="text-xs text-white/60">
              +{subscriptions.length - maxDisplay} more subscriptions
            </span>
          </div>
        )}
      </div>
    </ProfileDashboardBox>
  );
};

export default SubscriptionsBox;
