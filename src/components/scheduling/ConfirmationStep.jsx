// src/components/scheduling/ConfirmationStep.jsx

import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import FormTitle from '../common/FormsTitle';
import { useTranslation } from 'react-i18next';

export default function ConfirmationStep() {
    const { t } = useTranslation();
    return (
        <div className="text-center text-white p-8 animate-fade-in">
            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <FormTitle title={t('scheduling.confirmation.title', { defaultValue: 'Payment Successful!' })} />
            <p className="text-gray-300 mb-6">Your appointment has been confirmed. You will receive an email confirmation shortly.</p>
            <Link
                to="/profile/appointments"
                className="px-6 py-3 bg-[#BFA200] text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg hover:shadow-xl transition-shadow duration-200"
            >
                View My Appointments
            </Link>
        </div>
    );
}