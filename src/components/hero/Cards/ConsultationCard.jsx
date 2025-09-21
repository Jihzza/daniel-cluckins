// src/components/hero/Cards/ConsultationCard.jsx
import React from 'react';
import Button from '../../ui/Button';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

export default function ConsultationCard({ onScheduleClick }) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  const handleCardClick = () => {
    document.getElementById('consultations-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    onScheduleClick?.();
  };

  return (
    <motion.div
      className="bg-transparent border-2 md:border-3 border-[#BFA200] rounded-2xl p-4 text-center flex flex-col items-center cursor-pointer h-full shadow-lg hover:shadow-xl transition-shadow duration-200 min-h-[258px]"
      onClick={handleCardClick}
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
      whileHover={prefersReduced ? undefined : { scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12 }}
    >
      <div className="flex-1 flex flex-col justify-start">
        <h3 className="text-2xl font-bold text-white mb-3">{t('hero.services.consultation.title')}</h3>

        <div className="justify-center items-center flex flex-col mt-6">
          <p className="text-3xl font-bold text-white">{t('hero.services.consultation.price')}</p>
          <p className="text-xs md:text-sm text-white/75 mt-1">{t('hero.services.consultation.minDuration')}</p>
        </div>
      </div>

      <div className="w-full flex flex-col justify-center items-center">
        <Button onClick={handleButtonClick} className="cursor-pointer">
          {t('hero.services.consultation.button')}
        </Button>
        <a href="#consultations-section" className="inline-block text-xs md:text-base text-white/75 cursor-pointer" onClick={(e)=>e.stopPropagation()}>
          {t('hero.services.consultation.learnMore')}
        </a>
      </div>
    </motion.div>
  );
}
