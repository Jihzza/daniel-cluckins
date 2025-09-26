// src/pages/sections/HeroSection.jsx

import React from 'react';
import Daniel from '../../assets/images/Daniel.jpg';

// IMPORT COMPONENTS
import LearnFromHeader from '../../components/hero/LearnFromHeader';
import WordCarousel from '../../components/hero/WordCarousel';
import CtaSection from '../../components/hero/CtaSection';
import FeatureCarousel from '../../components/hero/FeatureCarousel';
import ServicesPreview from '../../components/hero/ServicesPreview';

export default function HeroSection({ onScheduleConsultation, onScheduleCoaching, onScheduleInvestment }) {
    return (
        // The overflow-hidden here can now be safely removed.
        <section id="hero-section" className="w-full py-2 md:py-4 sm:px-6">
            <LearnFromHeader />

            {/* Client Image - SOLUTION APPLIED HERE */}
            <div className="flex w-full justify-center">
                {/* 1. We constrain the container. `max-w-xs` is a good mobile-first choice. */}
                <div className="w-full py-2 md:py-4 max-w-xs md:max-w-lg lg:max-w-lg"> 
                    <img 
                        src={Daniel} 
                        alt="Daniel" 
                        className="rounded-xl w-full object-cover" 
                    />
                </div>
            </div>

            <WordCarousel />
            <CtaSection />
            <FeatureCarousel />
            <ServicesPreview 
                onScheduleConsultation={onScheduleConsultation} 
                onScheduleCoaching={onScheduleCoaching} 
                onScheduleInvestment={onScheduleInvestment} 
            />
        </section>
    );
}