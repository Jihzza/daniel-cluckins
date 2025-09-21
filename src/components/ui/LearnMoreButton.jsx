// src/components/common/LearnMoreButton.jsx
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function LearnMoreButton({
  children,
  className = '',
  disabled = false,
  ...props
}) {
  const prefersReduced = useReducedMotion();

  const motionProps =
    prefersReduced || disabled
      ? {}
      : { whileHover: { scale: 1.06 }, whileTap: { scale: 0.95 }, transition: { duration: 0.12 } };

  return (
    <motion.button
      type="button"
      disabled={disabled}
      className={[
        'w-auto text-xs leading-[1.45] tracking-[0.015em] py-2 rounded-lg text-[#F4C430] font-bold',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        className,
      ].join(' ')}
      aria-busy={disabled ? 'true' : undefined}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.button>
  );
}
