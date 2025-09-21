// src/components/scheduling/PaymentStep.jsx

import React from 'react';
import { format } from 'date-fns';
import FormButton from '../common/Forms/FormButton';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next'; // 1. Import the hook
import StripeLogo from '../../assets/images/stripe.svg';
import SSLLogo from '../../assets/images/ssl.svg';

// A helper to format currency
const formatPrice = (amount) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

/**
 * Renders the payment summary and initiates checkout or shows a success message
 * @param {string} paymentStatus - 'awaiting', 'success', or 'cancelled'.
 * @param {object} formData - The complete form data to derive summary details
 * @param {number} price - The calculated price for the service
 * @param {function} onInitiateCheckout - Callback to start the Stripe checkout process
 * @param {boolean} isProcessing - Flag to disable the button while communicating with the server
 */
export default function PaymentStep({ paymentStatus, formData, price, onInitiateCheckout, isProcessing }) {
    const { t } = useTranslation(); // 3. Initialize the hook

    if (paymentStatus === 'cancelled') {
        return (
            <div className="text-center">
                {/* 4. Use translated text for cancelled view */}
                <h2 className="text-2xl font-bold text-gray-800 mt-4">{t('scheduling.paymentStep.cancelledTitle')}</h2>
                <p className="text-gray-600 mt-2">{t('scheduling.paymentStep.cancelledMessage')}</p>
                <div className="mt-6">
                    <FormButton onClick={onInitiateCheckout} disabled={isProcessing}>
                        {isProcessing 
                            ? t('scheduling.paymentStep.processingButton') 
                            : t('scheduling.paymentStep.payButton', { price: formatPrice(price) })}
                    </FormButton>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="rounded-2xl p-6 bg-black/10 backdrop-blur-md shadow-sm hover:bg-white/15 hover:shadow-md transition-all duration-200 space-y-4 md:flex md:flex-col md:justify-center md:items-center md:text-center">
                {formData.serviceType === 'consultation' && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">{t('scheduling.paymentStep.consultationTitle')}</h3>
                        <p className="text-white">{t('scheduling.paymentStep.dateLabel')}: {format(formData.consultation.date, 'eeee, MMM d, yyyy')}</p>
                        <p className="text-white">{t('scheduling.paymentStep.timeLabel')}: {formData.consultation.time}</p>
                        <p className="text-white">{t('scheduling.paymentStep.durationLabel')}: {formData.consultation.duration} {t('scheduling.paymentStep.minutes')}</p>
                    </div>
                )}

                {formData.serviceType === 'coaching' && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white md:text-2xl">{t('scheduling.paymentStep.coachingPlanTitle')}</h3>
                        <p className="text-white capitalize md:text-xl">{t('scheduling.paymentStep.planLabel')}: {formData.coaching.plan}</p>
                    </div>
                )}

                <div className="border-t md:border-t-2 md:w-50 border-[#333333] pt-4 flex justify-between items-center md:flex-col md:justify-center md:items-center md:space-y-2">
                    <span className="text-lg font-semibold text-white md:text-xl">{t('scheduling.paymentStep.totalLabel')}</span>
                    <span className="text-xl font-bold text-[#BFA200] md:text-2xl">{formatPrice(price)}</span>
                </div>
            </div>

            <div className="p-6 rounded-lg flex space-x-4 items-center justify-center md:space-x-8">
                <img src={StripeLogo} alt="Stripe Logo" className="w-15 justify-center md:w-25 text-shadow-xl" />
                <img src={SSLLogo} alt="SSL Logo" className="w-10 justify-center md:w-13 text-shadow-xl" />
            </div>

            <div className='flex justify-center'>
                <FormButton onClick={onInitiateCheckout} disabled={isProcessing}>
                    {isProcessing 
                        ? t('scheduling.paymentStep.redirectingButton') 
                        : t('scheduling.paymentStep.checkoutButton')}
                </FormButton>
            </div>
            <p className="text-center text-xs text-white mt-4 md:text-sm">{t('scheduling.paymentStep.stripeRedirectMessage')}</p>
        </div>
    );
}