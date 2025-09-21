// src/pages/ServiceSelectionPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import ServiceSelectionStep from '../components/scheduling/ServiceSelectionStep';
import FormTitle from '../components/common/FormsTitle';

export default function ServiceSelectionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedService, setSelectedService] = useState(null);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleServiceSelect = (serviceId) => {
    setSelectedService(serviceId);
  };

  const handleNext = () => {
    if (selectedService) {
      navigate(`/schedule?service=${selectedService}`);
    }
  };

  const isNextDisabled = !selectedService;

  return (
    <div className="min-h-full flex flex-col">
      {/* Content area */}
      <main className="flex-1 w-full flex items-start">
        <div className="w-full max-w-2xl mx-auto px-4 py-4">
          <div className="w-full rounded-2xl bg-[#002147] p-4 md:p-6 flex-shrink-0">
            {/* Step content */}
            <FormTitle title={t('scheduling.selectServiceTitle', { defaultValue: 'Choose a service' })} />
            <ServiceSelectionStep 
              selectedService={selectedService}
              onSelectService={handleServiceSelect}
            />
            
            {/* Bottom padding so content won't be hidden under sticky controls */}
            <div style={{ height: '88px' }} />
          </div>
        </div>
      </main>

      {/* Sticky controls at bottom (always visible) */}
      <div
        className="sticky bottom-0 left-0 right-0"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Back */}
          <motion.button
            onClick={handleBackToHome}
            type="button"
            className="px-6 py-2 text-sm md:text-base font-semibold text-white bg-black rounded-md shadow-xl cursor-pointer hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 active:scale-[0.98] transition"
            whileHover={{ scale: 1.06, transition: { duration: 0.08 } }}
            whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
          >
            {t('scheduling.backButton', { defaultValue: 'Back' })}
          </motion.button>

          {/* Next */}
          <div className="flex flex-col items-end">
            <motion.button
              onClick={handleNext}
              type="button"
              disabled={isNextDisabled}
              aria-disabled={isNextDisabled}
              aria-describedby={isNextDisabled ? 'next-hint' : undefined}
              className={[
                'px-6 py-2 text-sm md:text-base font-semibold rounded-md transition',
                isNextDisabled
                  ? 'bg-[#bfa200]/30 text-gray-300 cursor-not-allowed shadow-none ring-1 ring-gray-400/30'
                  : 'bg-[#BFA200] text-black shadow-xl hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFA200]/40 active:scale-[0.98]',
              ].join(' ')}
              // Remove hover/tap motion when disabled so it doesn't feel interactive
              whileHover={isNextDisabled ? undefined : { scale: 1.06, transition: { duration: 0.08 } }}
              whileTap={isNextDisabled ? undefined : { scale: 0.95, transition: { duration: 0.08 } }}
            >
              {t('scheduling.nextButton', { defaultValue: 'Next' })}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
