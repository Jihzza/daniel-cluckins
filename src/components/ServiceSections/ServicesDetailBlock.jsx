// src/components/consultations/ConsultationDetailBlock.jsx

import React from 'react';

/**
 * A simple, reusable component for displaying consultation details.
 * @param {string} icon - The icon to display.
 * @param {string} title - The title of the detail.
 * @param {string} description - The description of the detail.
 */
export default function ServicesDetailBlock({ icon, title, description }) {
    return (
        <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex-shrink-0 bg-white rounded-full p-4">
                <img src={icon} alt={`${title} icon`} className="w-8 h-8" />
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
                <h4 className="font-medium text-white text-xl md:text-2xl">{title}</h4>
                <p className="text-white md:text-lg">{description}</p>
            </div>
        </div>
    );
}