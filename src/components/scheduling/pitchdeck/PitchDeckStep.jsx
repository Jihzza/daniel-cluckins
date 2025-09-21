// src/components/scheduling/pitchdeck/PitchDeckStep.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function PitchDeckStep({ selectedDeck, onSelectDeck }) {
  const { t } = useTranslation();

  const pitchDecks = useMemo(
    () => t('scheduling.pitchDeck.decks', { returnObjects: true }),
    [t]
  );

  return (
    <div className="w-full">
      {/* Match CoachingPlanStep container: centered column */}
      <div className="space-y-4 flex flex-col items-start">
        {pitchDecks.map((deck) => {
          const isSelected = selectedDeck === deck.id;
          const hoverScale = 1.03;

          return (
            <motion.button
              key={deck.id}
              type="button"
              onClick={() => onSelectDeck(deck.id)}
              aria-pressed={isSelected ? 'true' : 'false'}
              whileHover={{ scale: hoverScale }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.04 }}
              className={`
                w-full max-w-sm p-3 rounded-lg cursor-pointer transition-all duration-200 md:p-4 bg-black/10 backdrop-blur-md border border-white/20
                ${isSelected
                  ? 'border-[#bfa200] shadow-xl hover:bg-white/15'
                  : 'hover:border-[#bfa200] hover:bg-white/15 hover:shadow-md transition-shadow duration-200'
                }
              `}
            >
              <h3 className="text-lg text-center text-white md:text-xl">{deck.title}</h3>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
