// src/components/profile/SettingsSectionHeader.jsx

import React from 'react';

/**
 * A reusable header for sections within settings cards.
 * Color-only change: text color moved from gray-800 to slate-100 for dark surfaces.
 */
const SettingsSectionHeader = ({ title, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold text-slate-100 tracking-tight ${className}`}>
      {title}
    </h3>
  );
};

export default SettingsSectionHeader;
