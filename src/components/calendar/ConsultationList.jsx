// src/components/calendar/ConsultationList.jsx
import React from 'react';
import AppointmentCard from '../appointments/AppointmentCard';
import { useTranslation } from 'react-i18next';

export default function ConsultationList({ appointments, title }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {appointments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-base">{t('calendar.noAppointments')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(app => (
            <AppointmentCard key={app.id} appointment={app} />
          ))}
        </div>
      )}
    </div>
  );
}
