// src/pages/profile/PitchDeckRequestsPage.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPitchDeckRequestsByUserId } from '../../services/pitchDeckServices';
import PitchDeckRequestCard from '../../components/pitchdeck/PitchDeckRequestCard';
import ProfileSectionLayout from '../../components/profile/ProfileSectionLayout';
import SectionTextWhite from '../../components/common/SectionTextWhite';
import { useTranslation } from 'react-i18next';

export default function PitchDeckRequestsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        setRequests([]);
        return;
      }
      try {
        setLoading(true);
        const { data, error: fetchError } = await getPitchDeckRequestsByUserId(user.id);
        if (fetchError) throw fetchError;
        const normalized = (data || []).map((r) => ({
          ...r,
          company_name: r.company_name ?? r.project ?? r.name ?? r.email ?? t('pitchDeckRequests.unknownCompany'),
          submitted_at: r.submitted_at ?? r.created_at ?? null,
        }));
        setRequests(normalized);
      } catch (e) {
        console.error('Failed to fetch pitch deck requests:', e);
        setError(t('pitchDeckRequests.error'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, t]);

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-500">{t('pitchDeckRequests.loading')}</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!requests.length) return <p className="text-center text-gray-500">{t('pitchDeckRequests.empty')}</p>;
    return requests.map((req) => <PitchDeckRequestCard key={req.id} request={req} />);
  };

  return (
    <div className="bg-[#002147]  h-full">
      <ProfileSectionLayout>
        <SectionTextWhite title={t('pitchDeckRequests.title')} />
        <div className="space-y-4">{renderContent()}</div>
      </ProfileSectionLayout>
    </div>
  );
}
