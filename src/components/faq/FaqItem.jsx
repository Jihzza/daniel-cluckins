// src/components/faq/FaqItem.jsx
import React, { useState } from 'react';

/**
 * A resuable, self container and accessible FAQ item component
 * It manages its own state to toggle the visibility of the answer
 * @param {string} question - The question to display
 * @param {string} answer - The answer to display
 */

export default function FaqItem({ question, answer }) {
    // STATE MANAGEMENT
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="border-b border-gray-200 bg-red-500">
            <button
                onClick={toggleOpen}
                className="w-full lg:max-w-6xl flex justify-between items-center text-left text-gray-800 focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${question.replace(/\s+/g, '-')}`}
            >
                <span className="text-lg font-medium">{question}</span>
                <span className="text-xl">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>

            <div
                id={`faq-answer-${question.replace(/\s+/g, '-')}`} // The ID that `aria-controls` refers to.
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-screen mt-4' : 'max-h-0'
                }`}
            >
                <p className="text-gray-600">{answer}</p>
            </div>
        </div>
    );
}