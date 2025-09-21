// src/components/common/SectionNavigator.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollArea from './ScrollArea';

/**
 * Reusable nav for switching sections.
 * Accepts either `activeSectionId` (preferred) or `activeSection` (back-compat).
 */
export default function SectionNavigator({
  sections,
  activeSectionId,
  activeSection,           // ← back-compat with older callers
  onSelectSection,
  className = '',
}) {
  const activeId = activeSectionId ?? activeSection;
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <ScrollArea axis="x" hideScrollbar className={`flex justify-start items-center gap-2 h-auto py-2 ${className}`}>
      {sections.map((section) => {
        const isActive = activeId === section.id;
        const isHovered = hoveredButton === section.id;
        const baseScale = isActive ? 1 : 1;
        const hoverScale = isActive ? 1.09 : 1.06;

        // Only show hover styling if button is actually hovered and not active
        const shouldShowHover = isHovered && !isActive;

        return (
          <motion.button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            onMouseEnter={() => setHoveredButton(section.id)}
            onMouseLeave={() => setHoveredButton(null)}
            aria-current={isActive ? 'true' : undefined}
            className={[
              // keep your original sizing/shape
              'px-3 py-1 rounded-lg text-sm md:px-4 md:py-2 md:text-lg lg:px-3 lg:py-1',
              // colors for active/inactive - use controlled hover state
              isActive
                ? 'bg-[#BFA200] text-black shadow-lg'
                : shouldShowHover
                ? 'bg-[#BFA200] text-black shadow-lg'
                : 'bg-[#001B3A] text-white border border-white/20',
              // hand cursor for obvious clickability
              'cursor-pointer',
              // focus ring stays for a11y
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/70',
              // smooth transitions
              'transition-all duration-200',
            ].join(' ')}
            // header-like micro-interactions
            animate={{ scale: baseScale }}
            whileHover={{ scale: hoverScale }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.12 }}
          >
            {section.label}
          </motion.button>
        );
      })}
    </ScrollArea>
  );
}
