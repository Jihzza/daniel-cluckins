// src/pages/sections/AboutMeSection.jsx

import React from 'react';
import SectionText from '../../components/common/SectionTextWhite';
import { useTranslation } from 'react-i18next'; // 1. Import the hook

export default function AboutMeSection() {
    const { t } = useTranslation(); // 2. Initialize the hook

    return (
        <section id="about-me-section" className="w-full max-w-5xl py-4 md:px-6">
            {/* 3. Use the 't' function for the title and body */}
            <SectionText title={t('aboutMe.title')}>
                {t('aboutMe.body')}
            </SectionText>
        </section>
    );
}