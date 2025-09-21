import React from 'react';
import GlobeIcon from '../../assets/icons/Globe Branco.svg';
import { motion, useReducedMotion } from 'framer-motion';

export default function LanguageButton({ onClick, ariaExpanded }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-haspopup="menu"
      aria-expanded={ariaExpanded}
      onClick={onClick}
      className="flex items-center rounded-full cursor-pointer"
      whileHover={prefersReduced ? undefined : { scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.12 }}
      aria-label="Change language"
      style={{ transformOrigin: 'center' }}
    >
      <img src={GlobeIcon} alt="" className="h-5 w-5 md:h-7 md:w-7" />
      <span className="sr-only">Change language</span>
    </motion.button>
  );
}
