// src/components/social/SocialMediaIcon.jsx
import React from 'react';

export default function SocialMediaIcon({ href, iconSrc, altText, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={altText}
      className="
        group w-full relative
        flex items-center
        rounded-xl border-2 border-white/20
        p-3 md:p-4 lg:p-3
        shadow-lg transition-all duration-300 ease-in-out bg-[#002147]
        hover:shadow-xl hover:scale-105
      "
    >
      {/* Icon locked to the start (left) */}
      <img
        src={iconSrc}
        alt={altText}
        className="w-8 h-8 md:w-10 md:h-10 lg:w-8 lg:h-8 filter invert"
      />

      {/* Label perfectly centered within the rectangle */}
      <span
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          font-medium md:text-lg text-center pointer-events-none text-white
        "
      >
        {label}
      </span>
    </a>
  );
}
