// src/components/faq/FaqDropdown.jsx

import React from 'react';

/**
 * A presentional component that renderss a list of the questions for the FAQ dropdown
 * @param {Array<Object>} items
 * @param {function(number)} onSelect
 * @param {function} onClose
 */

export default function FaqDropdown({ items, onSelect, onClose }) {

    const handleItemCLick = (index) => {
        onSelect(index);
        onClose();
    };

    return (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-t-md rounded-b-lg shadow-lg z-10 -mt-1 max-h-50 overflow-y-auto">
            <ul>
                {/* We map over the `items` array to create a list item for each question. */}
                {items.map((faq, index) => (
                    <li key={index} className="px-4" >
                        {/* Using a <button> is essential for accessibility. */}
                        <button
                            onClick={() => handleItemClick(index)}
                            // Styling for each item in the list.
                            className="w-full text-left py-3 text-black border-b border-[#002147] md:text-lg"
                        >
                            {faq.question}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}