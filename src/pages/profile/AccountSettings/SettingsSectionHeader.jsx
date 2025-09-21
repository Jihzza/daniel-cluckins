// src/components/profile/SettingsSectionHeader.jsx

import React from 'react';

/**
 * A reusable header for sections within settings cards.
 * @param {string} title
 * @param {string} [className]
 */
const SettingsSectionHeader = ({ title, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold text-white tracking-tight ${className}`}>
      {title}
    </h3>
  );
};

export default SettingsSectionHeader;
