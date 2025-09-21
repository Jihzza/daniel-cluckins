// src/components/carousel/BaseCarousel.jsx

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Navigation, Pagination, A11y } from 'swiper/modules';

// --- STYLES ---
// Import all possible Swiper styles here. This ensures that any Swiper feature
// we decide to use will be styled correctly without needing to import CSS in multiple places.
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/a11y';
/**
 * A highly reusable and configurable carousel component built on top of Swiper.js.
 * This component encapsulates common Swiper logic and allows for custom slide rendering
 * via a render prop, adhering to SOLID principles.
 *
 * @param {Array<any>} items - The array of data to be rendered as slides.
 * @param {function(item: any, index: number): React.ReactNode} renderItem - A function that takes an item and its index from the `items` array and returns the JSX for the slide. This is the key to our flexible architecture.
 * @param {object} [swiperConfig={}] - An optional object to provide or override Swiper settings for a specific use case.
 * @param {string} [slideClassName=''] - Optional CSS classes to apply to each SwiperSlide component.
 * @param {string} [containerClassName=''] - Optional CSS classes to apply to the main Swiper container.
 * @returns {React.ReactNode}
 */
export default function BaseCarousel({
    items = [],
    renderItem,
    swiperConfig = {},
    slideClassName = '',
    containerClassName = ''
}) {

    // --- 1. DEFINE DEFAULT CONFIGURATION ---
    // The "Why": We establish a baseline for all carousels. This ensures consistency.
    // Any instance of the carousel can override these defaults by passing a `swiperConfig` prop.
    const defaultConfig = {
        modules: [Autoplay, EffectCoverflow, Navigation, Pagination, A11y],
        a11y: { enabled: true },
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        watchSlidesProgress: true,
    };

    // --- 2. MERGE CONFIGURATIONS ---
    // The "Why": We merge the `defaultConfig` with the user-provided `swiperConfig`.
    // The spread syntax `{...defaultConfig, ...swiperConfig}` ensures that any properties
    // in `swiperConfig` will overwrite the default ones, giving us precise control.
    const finalConfig = {
        ...defaultConfig,
        ...swiperConfig,
        modules: [
          ...new Set([...(defaultConfig.modules || []), ...((swiperConfig.modules) || [])])
        ],
      };    

    // --- 3. RENDER LOGIC ---
    // The "Why": The component's render output is clean and declarative. It's clear that
    // this component's job is to render a Swiper instance and loop over items.
    
    return (
        <Swiper {...finalConfig} className={containerClassName}>
            {/* --- 4. DYNAMIC SLIDE RENDERING --- */}
            {/* The "Why": This is the most critical part of the pattern. We map over the `items` array.
                Instead of having hardcoded JSX for the slide, we call the `renderItem` function
                that was passed in as a prop. This delegates the responsibility of *what* to render
                for each slide back to the parent component, giving us maximum flexibility.
            */}
            {items.map((item, index) => {
                return (
                    <SwiperSlide key={index} className={slideClassName}>
                        {renderItem(item, index)}
                    </SwiperSlide>
                );
            })}
        </Swiper>
    );
}