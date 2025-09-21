// src/components/profile/AccountSettingsBox.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cog6ToothIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ProfileDashboardBox from './ProfileDashboardBox';

/**
 * Account Settings section box showing account information and quick actions
 */
const AccountSettingsBox = ({ 
  user,
  to = '/settings' 
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <ProfileDashboardBox 
      title="Account & Settings" 
      to={to}
      className="bg-black/10"
    >
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
          <UserCircleIcon className="h-5 w-5 text-white/80" />
          <div>
            <span className="text-sm font-medium text-white/90 block">Email</span>
            <span className="text-xs text-white/70">{user?.email || 'Not available'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
          <ShieldCheckIcon className="h-5 w-5 text-white/80" />
          <div>
            <span className="text-sm font-medium text-white/90 block">Account Created</span>
            <span className="text-xs text-white/70">
              {user?.created_at ? formatDate(user.created_at) : 'Not available'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 rounded-xl ring-1 ring-gray-300 shadow-sm">
          <Cog6ToothIcon className="h-5 w-5 text-white/80" />
          <div>
            <span className="text-sm font-medium text-white/90 block">Settings</span>
            <span className="text-xs text-white/70">Manage your account preferences</span>
          </div>
        </div>
      </div>
    </ProfileDashboardBox>
  );
};

export default AccountSettingsBox;
