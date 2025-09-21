// src/components/common/SectionText.jsx
import React from 'react';

/**
 * A reusable component for section text.
 * Designed to be generic and easy to use in all sections
 * @param {string} title - The title of the section.
 * @param {React.ReactNode} children - The content of the section.
 */

export default function SectionTextWhite({ title, children }) {
    return (
        <div className="w-full text-center py-4 space-y-8">
            <h2 className="text-2xl font-bold text-white leading-tight md:text-3xl">{title}</h2>
            <div className="text-white text-base mx-auto md:text-xl">{children}</div>
        </div>
    );
}