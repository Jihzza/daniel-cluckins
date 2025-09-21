// src/components/hero/WordCarousel.jsx

import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import the hook

/**
 * An infinite, draggable word carousel.
 * Uses a CSS animation for smooth, continuous scrolling and JS for drag functionality
 */
export default function WordCarousel() {
    const { t } = useTranslation(); // 2. Initialize the hook

    // 3. Get the translated array. The { returnObjects: true } option is key.
    const words = t('hero.wordCarousel', { returnObjects: true });
    const duplicateWords = [...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words,...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words,...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words, ...words,];


    // STATE & REFS (No changes needed here)
    const carouselRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // EVENT HANDLERS (No changes needed here)
    const handleDragStart = (e) => {
        if (!carouselRef.current) return;
        setIsDragging(true);
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        setStartX(pageX - carouselRef.current.offsetLeft);
        setScrollLeft(carouselRef.current.scrollLeft);
        carouselRef.current.classList.add('is-dragging');
    };

    const handleDragEnd = () => {
        if (!carouselRef.current) return;
        setIsDragging(false);
        carouselRef.current.classList.remove('is-dragging');
    };

    const handleDragMove = (e) => {
        if (!isDragging || !carouselRef.current) return;
        e.preventDefault();
        const pageX = e.touches ? e.touches[0].pageX : e.pageX;
        const x = pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    // RENDER LOGIC
    return (
        <div className="w-full flex justify-center py-6 lg:py-4">
            <div
                className="w-[35%] md:w-[25%] lg:w-[15%] overflow-x-auto cursor-grab active:cursor-grabbing word-carousel-container"
                ref={carouselRef}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
            >
                {/* 4. The rest of the component works as before, but with translated words */}
                <div className="word-carousel-track flex">
                    {duplicateWords.map((word, index) => (
                        <div key={index} className="flex-shrink-0 mx-8 text-lg md:text-xl text-white whitespace-nowrap">
                            {word}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}