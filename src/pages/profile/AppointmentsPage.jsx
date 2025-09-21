// src/pages/profile/AppointmentsPage.jsx

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getAppointmentsByUserId } from '../../services/appointmentService';
import AppointmentCard from '../../components/appointments/AppointmentCard';
import ProfileSectionLayout from '../../components/profile/ProfileSectionLayout';
import { useTranslation } from 'react-i18next';
import SectionTextWhite from '../../components/common/SectionTextWhite';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [appointments, setAppointments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadAppointments = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error: fetchError } = await getAppointmentsByUserId(user.id);
        if (fetchError) throw fetchError;
        setAppointments(data || []);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError(t('appointments.error'));
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, [user, t]);

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-500">{t('appointments.loading')}</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (appointments.length === 0) return <p className="text-center text-gray-500">{t('appointments.empty')}</p>;
    return appointments.map(app => <AppointmentCard key={app.id} appointment={app} />);
  };

  return (
    <div className="bg-[#002147]  h-full">
      <ProfileSectionLayout>
        <SectionTextWhite title={t('appointments.title')} />
        <div className="space-y-4">
          {renderContent()}
        </div>
      </ProfileSectionLayout>
    </div>
  );
}
