// src/pages/sections/TestimonialsSection.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autoplay, Pagination } from 'swiper/modules';
import BaseCarousel from '../../components/carousel/BaseCarousel';
import SectionTextWhite from '../../components/common/SectionTextWhite';
import TestimonialCard from '../../components/testimonials/TestimonialCard';
import Button from '../../components/ui/Button';
import { getTestimonials } from '../../services/testimonialService';
import { useTranslation } from 'react-i18next';

// NEW: Floating CTA wrapper
import SectionCta from '../../components/ui/SectionCta';

export default function TestimonialsSection() {
    const { t } = useTranslation();
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // NEW: section ref for SectionCta exact-crossing behavior
    const sectionRef = useRef(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            setLoading(true);
            const { data, error } = await getTestimonials();
            if (error) {
                console.error("Failed to fetch testimonials:", error);
            } else {
                setTestimonials(data || []);
            }
            setLoading(false);
        };
        fetchTestimonials();
    }, []);

    const handleAddTestimonialClick = () => {
        navigate('/add-testimonial');
    };

    const swiperConfig = {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        spaceBetween: 80,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 200,       // NEW: adds the 3D “push forward” feel
          modifier: 2.5,
          slideShadows: false,
        },
        modules: [Autoplay, Pagination],
    };

    const renderTestimonialSlide = (testimonial) => (
        <TestimonialCard testimonial={testimonial} />
    );

    return (
        <section id="testimonials-section" ref={sectionRef} className="w-full max-w-5xl mx-auto pt-4 pb-4 text-center md:px-6 ">
            <SectionTextWhite title={t('testimonials.title')}>
                {t('testimonials.subtitle')}
            </SectionTextWhite>

            <div className="full-bleed py-8">
                <div className="w-full lg:max-w-6xl mx-auto desktop-fade-container">
                    {!loading && testimonials.length > 0 ? (
                        <BaseCarousel
                            items={testimonials}
                            renderItem={renderTestimonialSlide}
                            swiperConfig={swiperConfig}
                            containerClassName="testimonial-swiper"
                            slideClassName="swiper-slide-custom"
                        />
                    ) : (
                        <p className="text-gray-400 mt-8">{t('testimonials.noTestimonials')}</p>
                    )}
                </div>
            </div>

            {/* NEW: Floating CTA identical to other sections */}
            <SectionCta sectionRef={sectionRef}>
                <Button onClick={handleAddTestimonialClick}>{t('testimonials.leaveButton')}</Button>
            </SectionCta>
        </section>
    );
}
