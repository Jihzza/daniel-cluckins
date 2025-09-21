// src/components/common/Forms/FormButton.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Styled form button with loading + micro-interactions
 */
export default function FormButton({ children, fullWidth, isLoading, ...rest }) {
  const disabled = isLoading || rest.disabled;
  const widthClass = fullWidth ? 'w-full' : '';

  const motionProps = disabled
    ? {}
    : { whileHover: { scale: 1.06 }, whileTap: { scale: 0.95 }, transition: { duration: 0.12 } };

  return (
    <motion.button
      {...rest}
      type={rest.type || 'submit'}
      disabled={disabled}
      className={[
        widthClass,
        'w-auto text-base leading-[1.45] tracking-[0.01em] px-3 py-2 rounded-lg bg-[#BFA200] text-black font-bold md:px-5 md:py-4 md:text-lg lg:py-2 lg:px-4 lg:text-base',
        'shadow-lg hover:shadow-xl transition-shadow duration-200',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      ].join(' ')}
      {...motionProps}
    >
      {isLoading ? 'Processing...' : children}
    </motion.button>
  );
}
