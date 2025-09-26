// src/components/common/Forms/GoogleButton.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function GoogleButton({ onClick, disabled, fullWidth = true }) {
  const { t } = useTranslation();

  const motionProps = disabled
    ? {}
    : { whileHover: { scale: 1.06 }, whileTap: { scale: 0.95 }, transition: { duration: 0.12 } };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center justify-center gap-3 border border-gray-300 rounded-md text-gray-700 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200',
        fullWidth
          ? 'w-auto py-2 px-4 md:px-5 md:py-4 md:text-lg font-bold lg:py-2 lg:px-4 lg:text-base'
          : 'px-4 py-2',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        // keep your tiny hover tint without scaling the dropdowns, etc.
        disabled ? '' : 'hover:bg-gray-50',
      ].join(' ')}
      aria-label={t('scheduling.contactInfo.googleButtonText')}
      {...motionProps}
    >
      {/* Google mark */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.23 9.25 3.25l6.9-6.9C35.3 1.8 29.92 0 24 0 14.7 0 6.48 4.9 2.25 12l8.1 6.3C12.5 12.5 17.73 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.1 24.5c0-1.55-.14-3.05-.4-4.5H24v8.5h12.4c-.55 2.96-2.18 5.46-4.65 7.15l7.1 5.52C43.4 38.2 46.1 31.8 46.1 24.5z"/>
        <path fill="#FBBC05" d="M10.35 28.45a14.71 14.71 0 010-8.9l-8.1-6.3A23.95 23.95 0 000 24c0 3.93.93 7.63 2.55 10.95l7.8-6.5z"/>
        <path fill="#34A853" d="M24 47.5c6.48 0 11.9-2.14 15.87-5.82l-7.1-5.52c-2.11 1.42-4.83 2.27-8.77 2.27-6.27 0-11.5-4.08-13.38-9.6l-7.87 6.5C6.48 43.1 14.7 47.5 24 47.5z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      {t('scheduling.contactInfo.googleButtonText')}
    </motion.button>
  );
}
