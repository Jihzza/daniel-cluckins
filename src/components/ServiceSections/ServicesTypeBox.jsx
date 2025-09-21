// src/components/ServiceSections/ServicesTypeBox.jsx
import React from 'react';
import { motion } from 'framer-motion';

/**
 * A reusable, animated box for selecting a service type.
 * It's a "dumb" presentational component, receiving all its data and behavior via props.
 * @param {string} icon - The source path for the icon to display.
 * @param {string} title - The title of the service.
 * @param {function} onClick - The function to call when the box is clicked.
 * @param {boolean} isSelected - A flag to determine if the box is currently selected for styling.
 */
export default function ServicesTypeBox({ icon, title, onClick, isSelected }) {
    return (
        <motion.div
            layout // Animate layout changes.
            onClick={onClick}
            className={`
                p-4 border-2 rounded-lg cursor-pointer
                flex flex-col items-center justify-center text-center space-y-2 transition-colors duration-300 h-full
                ${isSelected
                    ? 'border-yellow-400 scale-105 shadow-lg'
                    : 'border-[#BFA200]'
                }
            `}
            whileTap={{ scale: 0.95 }} // Subtle shrink effect on tap.
        >
            <img src={icon} alt={`${title} icon`} className="w-8 h-8" />
            {/* --- MODIFICATION START --- */}
            {/* By giving the h3 a fixed height (h-8 which is 2rem) and using flex to center its content,
                we guarantee that this element's vertical space is always the same, whether the text
                wraps to a second line or not. This is the key to uniform card heights. */}
            <h3 className="font-semibold text-white text-xs md:text-sm leading-tight h-8 flex items-center justify-center">{title}</h3>
            {/* --- MODIFICATION END --- */}
        </motion.div>
    );
}