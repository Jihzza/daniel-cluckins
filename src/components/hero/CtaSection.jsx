// src/components/hero/CtaSection.jsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import the hook

/**
 * Displayes the main CTA message for the hero section.
 */

export default function CtaSection() {
    const { t } = useTranslation(); // 2. Initialize the hook

    return (
        <div className="w-full text-center py-2 md:py-4 space-y-6 lg:space-y-8">
            {/* The main headline */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                {t('hero.cta.title')} {/* 3. Use the 't' function */}
            </h1>
            {/* The subheadline */}
            <p className="text-white max-w-xl md:max-w-2xl lg:max-w-2xl mx-auto md:text-xl lg:text-xl">
                {t('hero.cta.subtitle')} {/* 4. Use the 't' function */}
            </p>
        </div>
    );
}