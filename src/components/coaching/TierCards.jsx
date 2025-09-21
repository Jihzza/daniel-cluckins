// src/components/hero/service-cards/TierCards.jsx
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function TierCards({ tiers, selectedPlanId, onTierSelect }) {
  const prefersReduced = useReducedMotion();

  const handleTierClick = (planId) => {
    onTierSelect?.(selectedPlanId === planId ? null : planId);
  };

  return (
    <div className="bg-transparent rounded-lg text-center flex flex-col items-center m-0">
      <div className="flex justify-center space-x-4 my-6 w-full">
        {tiers.map((tier) => {
          const isSelected = selectedPlanId === tier.id;
          return (
            <motion.div
              key={tier.id}
              onClick={() => handleTierClick(tier.id)}
              className="border-2 border-[#BFA200] rounded-2xl p-3 flex-1 cursor-pointer space-y-1 shadow-lg hover:shadow-xl transition-shadow duration-200"
              style={{ scale: isSelected ? 1.02 : 1 }}
              whileHover={prefersReduced ? undefined : { scale: isSelected ? 1.07 : 1.02 }}
              whileTap={{ scale: isSelected ? 1.02 : 0.95 }}
              transition={{ duration: 0.12 }}
            >
              <p className="font-bold text-white text-lg md:text-2xl">{tier.price}€</p>
              <p className="text-base font-medium text-white md:text-xl">{tier.planName}</p>
              {tier.planDesc && <p className="text-xs text-white md:text-base">{tier.planDesc}</p>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
