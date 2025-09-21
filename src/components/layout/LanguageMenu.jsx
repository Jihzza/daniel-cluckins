// src/components/layout/LanguageMenu.jsx

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ScrollArea from '../common/ScrollArea';

export default function LanguageMenu({ open, topOffset, languages, currentKey, onSelect, onRequestClose, anchorRef }) {
  const menuRef = useRef(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  // Close on outside click, but allow clicks on the anchor (globe) and menu
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      const target = e.target;
      const insideMenu = menuRef.current && menuRef.current.contains(target);
      const insideAnchor = anchorRef?.current && anchorRef.current.contains(target);
      if (!insideMenu && !insideAnchor) onRequestClose?.();
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') onRequestClose?.();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onRequestClose, anchorRef]);

  if (!open) return null;

  const normalized = (currentKey || '').toLowerCase();

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ top: `${topOffset}px` }}
      className="fixed inset-x-0 z-50"
    >
      <div className="absolute inset-0"></div>
      <div className="relative w-full py-3">
        <ScrollArea axis="x" hideScrollbar className="flex items-center gap-3 px-4">
          {languages.map((lang) => {
            const keyLower = lang.key.toLowerCase();
            const isSelected = normalized === keyLower || normalized.startsWith(keyLower + '-');
            const isHovered = hoveredButton === lang.key;
            const shouldShowHover = isHovered && !isSelected;
            
            return (
              <motion.button
                key={lang.key}
                onClick={() => onSelect?.(lang.key)}
                onMouseEnter={() => setHoveredButton(lang.key)}
                onMouseLeave={() => setHoveredButton(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200
                  whitespace-nowrap flex-shrink-0
                  flex items-center gap-2
                  ${isSelected 
                    ? 'bg-[#BFA200] text-black' 
                    : shouldShowHover 
                    ? 'bg-[#BFA200] text-black shadow-lg'
                    : 'bg-[#001B3A] text-white border border-white/20'
                  }
                `}
              >
                <img src={lang.flag} alt={`${lang.label} flag`} className="w-4 h-3 object-contain" />
                {lang.label}
              </motion.button>
            );
          })}
        </ScrollArea>
      </div>
    </motion.div>
  );
}


