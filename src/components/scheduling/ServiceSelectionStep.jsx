// src/components/scheduling/ServiceSelectionStep.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const services = [
  { id: 'consultation', title: 'Consultations'},
  { id: 'coaching', title: 'Coaching' },
  { id: 'pitchdeck', title: 'Pitch Deck' },
];

export default function ServiceSelectionStep({ selectedService, onSelectService, showSelectedState = true }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleServiceClick = (serviceId) => {
    // If onSelectService is provided, use it (for use within SchedulingFormPage)
    // Otherwise, navigate to the scheduling form (for standalone use)
    if (onSelectService) {
      onSelectService(serviceId);
    } else {
      navigate(`/schedule?service=${serviceId}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {services.map((service) => {
          const isSelected = showSelectedState && selectedService === service.id;
          const baseScale = isSelected ? 1.06 : 1;
          const hoverScale = isSelected ? 1.03 : 1.03;

          return (
            <motion.button
              key={service.id}
              type="button"
              onClick={() => handleServiceClick(service.id)}
              aria-pressed={isSelected ? 'true' : 'false'}
              // header-style micro-interactions + pointer cursor
              animate={{ scale: baseScale }}
              whileHover={{ scale: hoverScale }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.04 }}
              className={[
                'p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-200 w-full bg-black/10 backdrop-blur-md border border-white/20',
                isSelected
                  ? 'border-[#bfa200] shadow-xl hover:bg-white/15'
                  : 'hover:border-[#bfa200] hover:bg-white/15 hover:shadow-md transition-shadow duration-200',
              ].join(' ')}
            >
              <h3 className="text-lg text-center text-white md:text-xl">
                {t(`scheduling.serviceSelection.serviceLabels.${service.id}`)}
              </h3>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
