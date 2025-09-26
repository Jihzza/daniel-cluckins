// src/components/common/LinkButton.jsx
import React from "react";

export default function LinkButton({ href, children, ariaLabel }) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block w-full max-w-md mx-auto
        rounded-full
        px-6 py-4
        text-center font-medium
        shadow-[0_8px_20px_rgba(0,0,0,0.08)]
        transition
        hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(0,0,0,0.12)]
        focus:outline-none focus:ring-4 focus:ring-emerald-300/60
        bg-white text-gray-900
        border border-gray-200
      "
    >
      {children}
    </a>
  );
}
