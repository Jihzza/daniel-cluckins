// src/components/social/SocialMediaIcon.jsx

import React from 'react';

/**
 * A reusable, presentational component for a single social media icon link.
 * It's designed to be a "dumb" component, receiving all data via props.
 *
 * @param {string} href - The URL the icon should link to.
 * @param {string} iconSrc - The imported source of the SVG icon.
 * @param {string} altText - The alternative text for the image, crucial for accessibility (A11y).
 */
export default function SocialMediaIcon({ href, iconSrc, altText }) {
  // --- RENDER LOGIC ---
  return (
    // The `<a>` tag makes the icon a clickable link.
    // - `target="_blank"` and `rel="noopener noreferrer"` are best practices for security and user experience when opening external links.
    // - The styling provides a transition effect for a professional feel on hover.
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={altText} // Provides an accessible name for screen readers.
      className="group flex items-center justify-center rounded-xl border-2 border-[#BFA200] p-3 md:p-4 shadow-lg transition-all duration-300 ease-in-out hover:bg-[#BFA200] hover:shadow-xl hover:scale-110 lg:p-3"
    >
      <img
        src={iconSrc}
        alt={altText}
        // We control the size of the icon here for consistency.
        className="w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8"
      />
    </a>
  );
}