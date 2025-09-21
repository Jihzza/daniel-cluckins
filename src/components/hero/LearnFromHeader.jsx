// src/components/hero/LearnFromHeader.jsx

import React from 'react';
import DaGalowLogo from '../../assets/images/DaGalow Logo.svg';
import { useTranslation } from 'react-i18next'; // 1. Import the hook

/**
 * A simple header component for the hero section.
 * Displays "Learn from" followed by the client's logo.
 * It's designed to be clean and reusable.
 */
export default function LearnFromHeader() {
    const { t } = useTranslation(); // 2. Initialize the hook

    return (
        // The main container uses flexbox to align items horizontally and center them vertically
        <div className="flex items-center justify-center py-2 lg:py-0">
            {/* 3. Use the 't' function with our key */}
            <span className="text-lg md:text-2xl font-bold text-white mr-2">{t('hero.learnFrom')}</span>
            <img src={DaGalowLogo} alt="DaGalow Logo" className="h-5.5 md:h-7" />
        </div>
    );
}