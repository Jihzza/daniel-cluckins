// src/components/ui/StepsCarousel.jsx
import React, { useRef, useCallback } from "react";
import BaseCarousel from "../carousel/BaseCarousel";
import StepsList from "./StepsList";

export default function StepsCarousel({
  steps = [],
  className = "",
  title = "",
  showNavigation = true
}) {
  const swiperRef = useRef(null);
  const canLoop = steps.length > 1; // loop requires at least 2 slides

  // Bind nav to the active (possibly cloned) slide's buttons
  const bindNavToActive = useCallback((swiper) => {
    const activeSlide = swiper.slides[swiper.activeIndex];
    if (!activeSlide) return;

    const prev = activeSlide.querySelector(".steps-nav-prev");
    const next = activeSlide.querySelector(".steps-nav-next");
    if (prev && next) {
      // Attach elements directly (HTMLElement supported)
      swiper.params.navigation.prevEl = prev;
      swiper.params.navigation.nextEl = next;

      // Re-init to pick up new elements
      swiper.navigation.destroy();
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, []);

  const swiperConfig = {
    // Use standard carousel behavior like other carousels
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 450,
    grabCursor: true,
    
    // Standard carousel settings (will be merged with BaseCarousel defaults)
    // BaseCarousel provides: loop: true, autoplay: { delay: 3000 }, etc.
    
    // Custom navigation binding
    onBeforeInit: (swiper) => { swiperRef.current = swiper; },
    onInit: (swiper) => bindNavToActive(swiper),
    onSlideChange: (swiper) => bindNavToActive(swiper),
    onLoopFix: (swiper) => bindNavToActive(swiper), // fires during loop corrections
  };

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-white leading-tight md:text-3xl text-center mb-6">
          {title}
        </h2>
      )}

      {/* Full width carousel that breaks out of parent container padding */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <BaseCarousel
          items={steps}
          swiperConfig={swiperConfig}
          containerClassName="w-full"
          slideClassName="swiper-slide-custom h-[420px] md:h-[480px] lg:h-[520px] flex items-center justify-center"
          renderItem={(item) => (
            <div className="w-full max-w-xl h-full">
              <StepsList
                icon={item.icon}
                title={item.title}
                description={item.description}
                // ⬅️ ⮕ arrows live *beside* the step title (per slide)
                titleLeft={
                  showNavigation && canLoop ? (
                    <button
                      className="steps-nav-prev flex items-center justify-center group cursor-pointer"
                      aria-label="Previous step"
                    >
                      <svg className="w-7 h-7 text-white group-hover:text-white/80 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  ) : null
                }
                titleRight={
                  showNavigation && canLoop ? (
                    <button
                      className="steps-nav-next flex items-center justify-center group cursor-pointer"
                      aria-label="Next step"
                    >
                      <svg className="w-7 h-7 text-white group-hover:text-white/80 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : null
                }
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}
