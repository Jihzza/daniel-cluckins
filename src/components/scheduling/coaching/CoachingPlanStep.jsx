// src/components/scheduling/coaching/CoachingPlanStep.jsx

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hooks
import { motion } from 'framer-motion';

// 2. Remove the hardcoded 'coachingPlans' and 'formatPrice' constants.

/**
 * A dumb component for selecting a coaching plan.
 * @param {string} selectedPlan - The ID of the currently selected plan ('basic', 'standard', or 'premium')
 * @param {function} onSelectPlan - A callback function that fires when a plan is selected
 */
export default function CoachingPlanStep({ selectedPlan, onSelectPlan }) {
    const { t } = useTranslation(); // 3. Initialize translation hook

    // 4. Dynamically create the coachingPlans array from the translation file.
    //    We use useMemo to prevent this array from being recalculated on every render.
    const coachingPlans = useMemo(() => 
        t('scheduling.coachingPlan.plans', { returnObjects: true }), 
        [t]
    );

    return (
        <div className="w-full">
            <div className="space-y-4 flex flex-col items-start">
                {/* 6. The mapping logic remains the same, but it now uses the dynamic `coachingPlans` array */}
                {coachingPlans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    const hoverScale = 1.03;

                    return (
                        <motion.button
                            key={plan.id}
                            type="button"
                            onClick={() => onSelectPlan(plan.id)}
                            aria-pressed={isSelected ? 'true' : 'false'}
                            // header-style micro-interactions + pointer cursor
                            whileHover={{ scale: hoverScale }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.04 }}
                            className={`
                                w-full max-w-sm p-3 rounded-lg cursor-pointer shadow-xl transition-all duration-200 md:p-4 bg-black/10 backdrop-blur-md border border-white/20
                                ${isSelected
                                    ? 'border-[#bfa200] shadow-xl hover:bg-white/15'
                                    : 'hover:border-[#bfa200] hover:bg-white/15 hover:shadow-md transition-shadow duration-200'
                                }
                            `}
                        >
                            <h3 className="text-lg text-center text-white md:text-xl">{plan.title}</h3>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}