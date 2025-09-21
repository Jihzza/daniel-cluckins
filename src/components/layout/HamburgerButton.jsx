// src/components/layout/HamburgerButton.jsx

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import HamburgerIcon from '../../assets/icons/Hamburger White.svg';

export default function HamburgerButton({ onClick }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      whileTap={{ scale: 0.90 }}
      whileHover={prefersReduced ? undefined : { scale: 1.05 }}
      transition={{ duration: 0.12 }}
      className="p-2 text-gray-400 hover:text-white cursor-pointer"
    >
      <img src={HamburgerIcon} alt="Hamburger Icon" className="h-7 w-5 md:h-7 md:w-7" />
    </motion.button>
  );
}


