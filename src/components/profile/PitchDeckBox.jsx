// src/components/profile/PitchDeckBox.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline';
import ProfileDashboardBox from './ProfileDashboardBox';

/**
 * Pitch Deck Requests section box showing recent requests
 */
const PitchDeckBox = ({ 
  requests = [], 
  to = '/profile/pitch-requests',
  maxDisplay = 2 
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'text-white/80';
      case 'in_review': return 'text-white/80';
      case 'feedback_sent': return 'text-white/80';
      case 'archived': return 'text-white/60';
      default: return 'text-white/60';
    }
  };

  const displayedRequests = requests.slice(0, maxDisplay);
  const hasMore = requests.length > maxDisplay;

  return (
    <ProfileDashboardBox 
      title="Pitch Deck Requests" 
      to={to}
      className="bg-black/10"
    >
      <div className="space-y-2">
        {displayedRequests.length > 0 ? (
          displayedRequests.map((request, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-4 w-4 text-white/80" />
                <div>
                  <span className="text-sm font-medium text-white/90 block">
                    {request.company || 'Untitled Request'}
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <ClockIcon className="h-3 w-3 text-white/60" />
                    <span className="text-xs text-white/70">
                      {formatDate(request.submittedAt || request.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status || 'Submitted'}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <DocumentTextIcon className="h-8 w-8 text-white/40 mx-auto mb-2" />
            <p className="text-sm text-white/70">No pitch deck requests yet</p>
          </div>
        )}
        
        {hasMore && (
          <div className="text-center pt-2">
            <span className="text-xs text-white/60">
              +{requests.length - maxDisplay} more requests
            </span>
          </div>
        )}
      </div>
    </ProfileDashboardBox>
  );
};

export default PitchDeckBox;
