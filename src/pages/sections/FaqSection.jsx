// src/pages/sections/FaqSection.jsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import the hook

// --- COMPONENT IMPORTS ---
import SectionTextBlack from '../../components/common/SectionTextBlack';
import FaqSelector from '../../components/faq/FaqSelector';

/**
 * A "view" component responsible for the layout of the FAQ section.
 * It now loads all its content dynamically for internationalization.
 */
export default function FaqSection() {
    // 2. Initialize the translation hook
    const { t } = useTranslation();

    // 3. Load all data from the translation file.
    // - t('faq.title') gets the title string.
    // - t('faq.items', { returnObjects: true }) gets the array of questions and answers.
    const faqTitle = t('faq.title');
    const faqData = t('faq.items', { returnObjects: true });

    return (
        <section id="faq-section" className="h-auto py-4 md:px-6">
            <div className="max-w-2xl mx-auto">
                {/* 4. Use the translated title */}
                <SectionTextBlack title={faqTitle} />

                <div>
                    {/* 5. Pass the translated data to the selector component */}
                    <FaqSelector items={faqData} />
                </div>
            </div>
        </section>
    );
}