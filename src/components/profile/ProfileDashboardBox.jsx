// src/components/profile/ProfileDashboardBox.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * A reusable dashboard box component for the profile page.
 * Displays content in a card format with optional navigation.
 * 
 * @param {string} title - The title of the box
 * @param {React.ReactNode} children - The content to display inside the box
 * @param {string} to - Optional route to navigate to when clicked
 * @param {string} className - Additional CSS classes
 * @param {boolean} clickable - Whether the box should be clickable
 */
const ProfileDashboardBox = ({ 
  title, 
  children, 
  to, 
  className = '', 
  clickable = true 
}) => {
  const content = (
    <div className={`bg-black/10 backdrop-blur-md rounded-2xl p-4 shadow-sm hover:bg-white/15 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {clickable && to && (
          <ChevronRightIcon className="h-5 w-5 text-white/70" />
        )}
      </div>
      <div className="text-white/90">
        {children}
      </div>
    </div>
  );

  if (clickable && to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default ProfileDashboardBox;
