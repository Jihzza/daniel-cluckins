// src/pages/profile/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/authService';
import { getAppointmentsByUserId } from '../../services/appointmentService';
import { getSubscriptionsByUserId } from '../../services/subscriptionService';
import { getPitchDeckRequestsByUserId } from '../../services/pitchDeckServices';
import { getFinancialMetrics } from '../../services/financialService';
import ProfileHeader from '../../components/profile/ProfileHeader';
import FinancesBox from '../../components/profile/FinancesBox';
import ConsultationsBox from '../../components/profile/ConsultationsBox';
import SubscriptionsBox from '../../components/profile/SubscriptionsBox';
import PitchDeckBox from '../../components/profile/PitchDeckBox';
import AccountSettingsBox from '../../components/profile/AccountSettingsBox';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    role: 'user',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    finances: {
      consultationEarnings: 0,
      coachingRevenue: 0,
      pitchDeckEarnings: 0
    },
    consultations: [],
    subscriptions: [],
    pitchDeckRequests: [],
    chatbotHistory: []
  });

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await getProfile(user.id);
        if (profileError) throw profileError;

        if (profileData) {
          const finalProfile = {
            ...profileData,
            avatar_url: profileData.avatar_url || user.user_metadata?.avatar_url || '',
          };
          setProfile(finalProfile);
        }

        // Fetch all dashboard data in parallel
        const [
          { data: financialData, error: financialError },
          { data: appointmentsData, error: appointmentsError },
          { data: subscriptionsData, error: subscriptionsError },
          { data: pitchDeckData, error: pitchDeckError }
        ] = await Promise.all([
          getFinancialMetrics(user.id),
          getAppointmentsByUserId(user.id),
          getSubscriptionsByUserId(user.id),
          getPitchDeckRequestsByUserId(user.id)
        ]);

        // Handle financial data
        if (financialError) {
          console.error('Financial data error:', financialError);
        }

        // Transform appointments data for the consultations box
        const consultationsData = appointmentsData?.map(appointment => ({
          duration: appointment.duration_minutes,
          status: appointment.status || 'Confirmed',
          price: appointment.price || (appointment.duration_minutes * 1.5) // Default €1.5 per minute
        })) || [];

        // Transform subscriptions data
        const planPricing = {
          'basic': 40,    // €40/month for basic plan
          'standard': 90, // €90/month for standard plan  
          'premium': 230  // €230/month for premium plan
        };

        const subscriptionsDataFormatted = subscriptionsData?.map(subscription => {
          const planId = subscription.plan_id?.toLowerCase();
          const price = planPricing[planId] || 0;
          return {
            planName: subscription.plan_id || 'Subscription',
            status: subscription.status || 'Active',
            price: price
          };
        }) || [];

        // Transform pitch deck requests data
        const pitchDeckDataFormatted = pitchDeckData?.map(request => ({
          company: request.company_name || request.project || request.name || 'Untitled Request',
          status: request.status || 'submitted',
          submittedAt: request.submitted_at || request.created_at
        })) || [];

        // Update dashboard data
        setDashboardData({
          finances: financialData || {
            consultationEarnings: 0,
            coachingRevenue: 0,
            pitchDeckEarnings: 0
          },
          consultations: consultationsData,
          subscriptions: subscriptionsDataFormatted,
          pitchDeckRequests: pitchDeckDataFormatted
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(t('profile.errors.load'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user, t]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };


  if (loading) {
    return <div className="p-4 text-center">{t('profile.loading')}</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="h-full bg-[#002147]">
      <ProfileHeader
        fullName={profile.full_name}
        phone={profile.phone}
        avatarUrl={profile.avatar_url}
        onEdit={() => navigate('/profile/edit')}
      />

      <div className="p-4 space-y-6">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Consultations Box - Top Right */}
          <ConsultationsBox
            consultations={dashboardData.consultations}
            to="/profile/appointments"
          />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subscriptions Box */}
          <SubscriptionsBox
            subscriptions={dashboardData.subscriptions}
            to="/profile/subscriptions"
          />

          {/* Pitch Deck Requests Box */}
          <PitchDeckBox
            requests={dashboardData.pitchDeckRequests}
            to="/profile/pitch-requests"
          />
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Finances Box - Top Left */}
          <FinancesBox
            consultationEarnings={dashboardData.finances.consultationEarnings}
            coachingRevenue={dashboardData.finances.coachingRevenue}
            pitchDeckEarnings={dashboardData.finances.pitchDeckEarnings}
            to="/profile/finances"
          />

          {/* Account Settings Box */}
          <AccountSettingsBox
            user={user}
            to="/settings"
          />
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-3 w-full text-left text-red-400 hover:bg-red-900/20 transition-colors duration-200 rounded-lg border border-red-400/30"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3 md:h-8 md:w-8" />
            <span className="text-lg font-base md:text-xl">
              {t('profile.logout')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
