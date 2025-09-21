// src/components/hero/ServicesPreview.jsx

import React from 'react';

// Import the new, detailed service card components.
import ConsultationCard from './Cards/ConsultationCard';
import CoachingCard from './Cards/CoachingCard';
import InvestmentCard from './Cards/InvestmentCard';

/**
 * A component to display a preview of the main services offered.
 * This now renders a vertical stack of detailed service cards.
 */
export default function ServicesPreview({ onScheduleConsultation, onScheduleCoaching, onScheduleInvestment }) {
  return (
    // `px-4` for horizontal padding.
    // `py-8` for vertical spacing.
    <div className="py-2 md:py-0 md:py-4 lg:py-0 lg:pt-8 lg:pb-4">
      {/* This is the main container for the service cards.
        - `flex flex-col`: Stacks the items vertically.
        - `space-y-4`: Adds vertical space between each card.
        - `max-w-xl mx-auto`: Constrains the width and centers it on larger screens.
      */}
      <div className="flex flex-col md:px-30 lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6 mx-auto justify-center">
      {/* We render each of our new card components in order. */}
      <div className="lg:flex-1">
          <ConsultationCard onScheduleClick={onScheduleConsultation} />
        </div>
        
        <div className="lg:flex-1">
          <CoachingCard onScheduleClick={onScheduleCoaching} />
        </div>

        <div className="lg:flex-1">
          <InvestmentCard onScheduleClick={onScheduleInvestment} />
        </div>
      </div>
    </div>
  );
}