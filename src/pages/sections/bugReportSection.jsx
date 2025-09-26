// src/pages/sections/BugReportSection.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/authService';
import { submitBugReport } from '../../services/bugReportService';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Import hook

import SectionTextBlack from '../../components/common/SectionTextBlack';
import BugReportForm from '../../components/bugReport/BugReportForm';
import Signup from '../../components/auth/Signup';

export default function BugReportSection() {
    const { t } = useTranslation(); // 2. Initialize hook
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formDefaults, setFormDefaults] = useState({ name: '', email: '' });

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormDefaults(prev => ({ ...prev, email: user.email }));
            const fetchProfile = async () => {
                const { data: profileData } = await getProfile(user.id);
                if (profileData?.full_name) {
                    setFormDefaults(prev => ({ ...prev, name: profileData.full_name }));
                }
            };
            fetchProfile();
        }
    }, [user, isAuthenticated]);

    const handleBugSubmit = async (formData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        const { error: submissionError } = await submitBugReport(formData, user?.id);
        if (submissionError) {
            setError(submissionError.message);
        } else {
            setSuccess(true);
        }
        setIsLoading(false);
    };
    
    const handleSignupRequest = () => {
        navigate('/signup');
    };

    // 3. Render component with translated text
    return (
        <section id="bug-report-section" className="max-w-4xl mx-auto py-8 text-center">
            <SectionTextBlack title={t('bugReport.title')}>
                {t('bugReport.subtitle')}
            </SectionTextBlack>

            <div className="mt-8 mx-auto w-full max-w-lg bg-[#002147] p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
                {isAuthenticated ? (
                    success ? (
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-green-400">{t('bugReport.success.title')}</h3>
                            <p className="text-gray-300 mt-2">{t('bugReport.success.message')}</p>
                            <button onClick={() => setSuccess(false)} className="mt-4 text-yellow-400 hover:underline">
                                {t('bugReport.success.button')}
                            </button>
                        </div>
                    ) : (
                        <BugReportForm
                            onSubmit={handleBugSubmit}
                            isLoading={isLoading}
                            defaultValues={formDefaults}
                        />
                    )
                ) : (
                    <div>
                        <p className="text-center text-gray-300 mb-4">
                            {t('bugReport.loggedOut.message')}
                        </p>
                        <Signup onSubmit={handleSignupRequest} isLoading={false} />
                    </div>
                )}
                {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
            </div>
        </section>
    );
}