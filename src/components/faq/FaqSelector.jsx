// src/components/faq/FaqSelector.jsx

import React, { useState } from 'react';
import FaqDropdown from './FaqDropdown';

/**
 * A smart component that manages the state and logic for the FAQ Dropdown
 * It encapsulates the entire interactive area for the FAQ dropdown
 * 
 * @param {Array<Object>} items
 */

export default function FaqSelector({ items }) {
    // STATE MANAGEMENT
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleQuestionClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSelectQuestion = (index) => {
        setActiveIndex(index);
        setIsDropdownOpen(false);
    };

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div>
            {/* POSITIONING CONTEXT WRAPPER */}
            <div className="relative">
                {/* CLICKABLE QUESTION RECTANGLE */}
                <button
                    onClick={handleQuestionClick}
                    className="w-full flex justify-between items-center text-left border-b border-black px-2 pb-4 cursor-pointer"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    <span className="text-lg font-medium text-black md:text-xl">{items[activeIndex].question}</span>

                    <svg className={`w-8 h-8 text-black transform transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* DROPDOWN COMPONENT */}
                {isDropdownOpen && (
                    <FaqDropdown
                        items={items}
                        onSelect={handleSelectQuestion}
                        onClose={() => setIsDropdownOpen(false)}
                    />
                )}
            </div>

            {/* VISIBLE ANSWER AREA */}
            <div className="mt-4 p-4 text-black">
                <p className="md:text-lg">{items[activeIndex].answer}</p>
            </div>
        </div>
    );
}