// src/pages/CalendarPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAppointmentsByUserId } from '../services/appointmentService';
import { isSameDay, parseISO, format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// --- COMPONENT IMPORTS ---
import SectionTextWhite from '../components/common/FormsTitle';
import ProfileSectionLayout from '../components/profile/ProfileSectionLayout';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import ConsultationList from '../components/calendar/ConsultationList';
import Button from '../components/ui/Button';

export default function CalendarPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [allAppointments, setAllAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const loadAppointments = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const { data, error: fetchError } = await getAppointmentsByUserId(user.id);
                if (fetchError) throw fetchError;
                setAllAppointments(data || []);
            } catch (err) {
                setError(t('calendar.error'));
            } finally {
                setLoading(false);
            }
        };
        loadAppointments();
    }, [user, t]);

    const filteredAppointments = useMemo(() => {
        if (!selectedDate) return allAppointments;
        // --- FIX IS HERE ---
        // Changed `app.appointment_date` to `app.appointment_start` to match the actual data shape.
        return allAppointments.filter(app => isSameDay(parseISO(app.appointment_start), selectedDate));
    }, [allAppointments, selectedDate]);

    const listTitle = useMemo(() => {
        if (selectedDate) return t('calendar.listTitleForDate', { date: format(selectedDate, 'PPP') });
        return t('calendar.listTitleAll');
    }, [selectedDate, t]);

    return (
        <div className="bg-[#002147] h-auto min-h-full">
            <ProfileSectionLayout>
                <SectionTextWhite title={t('calendar.pageTitle')} />
                
                {loading && <p className="text-center text-gray-500">{t('calendar.loading')}</p>}
                {error && <p className="text-center text-red-500">{error}</p>}

                {!loading && !error && (
                    <div className="flex flex-col space-y-6 mt-4">
                        <div className="rounded-2xl p-4 bg-black/10 backdrop-blur-md shadow-sm hover:bg-white/15 hover:shadow-md transition-all duration-200">
                            <AppointmentCalendar
                                appointments={allAppointments}
                                selectedDate={selectedDate}
                                onDateSelect={setSelectedDate}
                            />

                            {selectedDate && (
                                <div className="mt-4 flex justify-center">
                                    <Button
                                        onClick={() => setSelectedDate(null)}
                                        className="self-center"
                                    >
                                        {t('calendar.showAllButton')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl p-4 bg-black/10 backdrop-blur-md shadow-sm hover:bg-white/15 hover:shadow-md transition-all duration-200">
                            <ConsultationList
                                appointments={filteredAppointments}
                                title={listTitle}
                            />
                        </div>
                    </div>
                )}
            </ProfileSectionLayout>
        </div>
    );
}