// src/pages/SubscriptionsPage.jsx


import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSubscriptionsByUserId } from '../../services/subscriptionService';
import SubscriptionCard from '../../components/subscriptions/SubscriptionCard';
import ProfileSectionLayout from '../../components/profile/ProfileSectionLayout';
import { useTranslation } from 'react-i18next';
import SectionTextWhite from '../../components/common/SectionTextWhite';


export default function SubscriptionsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);


  React.useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) {                // <- if not logged in or not yet loaded
        setLoading(false);
        setSubscriptions([]);
        return;
      }
      try {
        setLoading(true);
        const { data, error: fetchError } = await getSubscriptionsByUserId(user.id);
        if (fetchError) throw fetchError;
        setSubscriptions(data || []);
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
        setError(t('subscriptions.error'));
      } finally {
        setLoading(false);
      }
    };
    loadSubscriptions();
  }, [user, t]);



  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-500">{t('subscriptions.loading')}</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (subscriptions.length === 0)
      return <p className="text-center text-gray-500">{t('subscriptions.empty')}</p>;


    return subscriptions.map((sub) => <SubscriptionCard key={sub.id} subscription={sub} />);
  };


  return (
    <div className="bg-[#002147] h-full">
      <ProfileSectionLayout>
        <SectionTextWhite title={t('subscriptions.title')} />
        <div className="space-y-4">{renderContent()}</div>
      </ProfileSectionLayout>
    </div>
  );
}