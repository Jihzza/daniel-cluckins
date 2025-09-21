// src/components/hero/Cards/CoachingCard.jsx
import React, { useState } from 'react';
import Button from '../../ui/Button';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

export default function CoachingCard({ onScheduleClick }) {
  const { t } = useTranslation();
  const prefersReduced = useReducedMotion();

  const tiers = [
    { id: 'basic', price: '40', planName: t('hero.services.coaching.tiers.basic'), billingCycle: 'm' },
    { id: 'standard', price: '90', planName: t('hero.services.coaching.tiers.standard'), billingCycle: 'm' },
    { id: 'premium', price: '230', planName: t('hero.services.coaching.tiers.premium'), billingCycle: 'm' },
  ];

  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const selectedTier = tiers.find(tier => tier.id === selectedPlanId);

  const buttonText = selectedTier
    ? `${t('hero.services.coaching.button')} - ${selectedTier.price}€/${selectedTier.billingCycle}`
    : t('hero.services.coaching.button');

  const handleCardClick = (e) => {
    // Only scroll if the click wasn't on a tier card
    if (!e.target.closest('[data-tier-card]')) {
      document.getElementById('coaching-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    onScheduleClick?.(selectedTier?.id ?? null);
  };

  const handleTierClick = (e, planId) => {
    e.stopPropagation();
    setSelectedPlanId(prev => (prev === planId ? null : planId));
  };

  return (
    <motion.div
      onClick={handleCardClick}
      className="bg-transparent border-2 md:border-3 border-[#BFA200] rounded-2xl p-4 text-center flex flex-col items-center cursor-pointer h-full shadow-lg hover:shadow-xl transition-shadow duration-200"
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
      whileHover={prefersReduced ? undefined : { scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12 }}
    >
      <div className="flex-1 flex flex-col justify-center">


      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-white mb-4">{t('hero.services.coaching.title')}</h3>
        <div className="flex justify-center space-x-2 mb-2 w-full">
          {tiers.map((tier) => {
            const isSelected = selectedPlanId === tier.id;
            return (
              <motion.div
                key={tier.id}
                data-tier-card
                // ⬇️ Block parent whileTap/whileHover from child taps/enters
                onPointerDownCapture={(e) => e.stopPropagation()}
                onTapStart={(e) => e.stopPropagation()}
                onKeyDownCapture={(e) => e.stopPropagation()} // keyboard "Enter" also triggers tap
                onClick={(e) => handleTierClick(e, tier.id)} // you already stopPropagation here
                className="border-2 md:border-3 border-[#BFA200] rounded-xl p-3 lg:p-2 flex-1 cursor-pointer h-[70px] w-[70px] flex flex-col justify-center items-center shadow-lg hover:shadow-xl transition-shadow duration-200"
                style={{ scale: isSelected ? 1.12 : 1 }}
                whileHover={prefersReduced ? undefined : { scale: isSelected ? 1.07 : 1.06 }}
                whileTap={{ scale: isSelected ? 1.02 : 0.95 }}
                transition={{ duration: 0.12 }}
              >
                <p className="font-bold text-white text-lg md:text-lg lg:text-lg">{tier.price}€</p>
                <p className="text-xs md:text-sm lg:text-xs text-white">{tier.planName}</p>
              </motion.div>
            );
          })}
        </div>
        <p className="text-xs text-white/75 mb-2">{t('hero.services.coaching.spots')}</p>
        <Button
          onClick={handleButtonClick}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onKeyDownCapture={(e) => e.stopPropagation()}
          className="cursor-pointer"
        >
          {buttonText}
        </Button>
        <a
          href="#coaching-section"
          className="inline-block text-xs md:text-base text-white/75 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          {t('hero.services.coaching.learnMore')}
        </a>
      </div>
    </motion.div>
  );
}
