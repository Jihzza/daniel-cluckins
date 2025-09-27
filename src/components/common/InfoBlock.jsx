// src/components/common/InfoBlock.jsx

import React from 'react';
import { motion } from 'framer-motion';

export default function InfoBlock({ iconSrc, altText, children, onClick, ariaLabel }) {
  // Keyboard-activate on Enter or Space
  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent page scroll on Space
      onClick();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full text-center">
      {/* Icon inside a styled, now-interactive box */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-[#002147] p-4 w-20 h-20 md:w-28 md:h-28
             flex items-center justify-center cursor-pointer outline-none
             focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#002147']"
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={onClick ? (ariaLabel || altText) : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <img src={iconSrc} alt={altText} className="w-13 h-13 object-contain pointer-events-none select-none" />
      </motion.div>

      <div className="text-black text-sm md:text-base font-normal mt-2">
        {children}
      </div>
    </div>
  );
}
