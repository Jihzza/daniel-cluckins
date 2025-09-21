// src/components/profile/ProfileMenuItem.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

/**
 * A reusable, presentational component for a single item in a profile menu.
 * It follows the Single Responsibility Principle: its only job is to display a
 * styled link with a label and an icon. It receives all data via props.
 *
 * @param {string} label - The text to display for the menu item (e.g., "Appointments").
 * @param {string} to - The route path to navigate to when clicked (e.g., "/profile/appointments").
 */
const ProfileMenuItem = ({ label, to }) => (
    // We use the Link component from react-router-dom for client-side navigation.
    <Link
        to={to}
        className="flex items-center justify-between p-4 w-full text-left transition-colors duration-200 md:p-5"
    >
        {/* The main text label for the menu item. */}
        <span className="text-lg text-white md:text-xl">{label}</span>
        
        {/* The chevron icon, indicating that clicking will navigate to another view. */}
        <ChevronRightIcon className="h-5 w-5 text-white md:h-6 md:w-6" />
    </Link>
);

export default ProfileMenuItem;