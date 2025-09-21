// src/components/consultations/ConsultationDetailBlock.jsx

import React from 'react'

/**
 * A simple, reusable component for displaying consultation details.
 * @param {string} icon - The icon to display.
 * @param {string} title - The title of the detail.
 * @param {string} description - The description of the detail.
 */
export default function StepsList({ icon, title, description, titleLeft = null, titleRight = null }) {
  return (
    <div className="h-full flex flex-col items-center text-center p-4 w-full mx-auto">
      <div className="flex-shrink-0 rounded-full p-4 bg-white border-1 border-white/15 text-white md:p-5 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <img src={icon} alt={`${title} icon`} className="w-8 h-8 md:w-10 md:h-10" />
      </div>
      <div className="mt-3 flex flex-col items-center text-center space-y-2 md:space-y-4 w-full">
        <div className="flex items-center justify-center gap-3">
          {titleLeft}
          <h4 className="font-bold text-white text-lg leading-tight tracking-[0.015em] md:text-2xl">
            {title}
          </h4>
          {titleRight}
        </div>
        {/* Body: LH ~1.45 (1.3–1.5 range) for readability at small sizes */}
        <p className="text-white text-sm leading-[1.5] md:text-lg line-clamp-6 md:line-clamp-8">
          {description}
        </p>
      </div>
      <div className="mt-auto" />
    </div>
  );
}