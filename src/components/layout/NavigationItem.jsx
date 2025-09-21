// src/components/layout/NavigationItem.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * A smart component that represents a single item in the navigation bar.
 * It handles its own click logic, determining whether to navigate to a new page,
 * perform a custom action, or navigate back if the user is already on the
 * item's destination page.
 *
 * @param {object} item - The navigation item's configuration object.
 * @param {React.ElementType} item.icon - The icon component to render.
 * @param {string} item.label - The text label for the item.
 * @param {string} [item.path] - The destination path for navigation.
 * @param {function} [item.onClick] - An optional custom function to execute on click.
 * @param {boolean} isActive - Whether the navigation item is currently active.
 */
export default function NavigationItem({ item, isActive }) {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Handles the click event for the navigation item.
     * This is the core logic for the "go back" functionality.
     */
    const handleItemClick = () => {
        // Case 1: The item has a custom onClick function (like the Chat button).
        // We prioritize this and execute it immediately.
        if (item.onClick) {
            item.onClick();
            return;
        }

        // Case 2: The user is already on the destination page of the clicked item.
        // In this case, we navigate back (-1) in the browser's history.
        if (item.path && location.pathname === item.path) {
            navigate(-1); // This is the "go back" action.
            return;
        }

        // Case 3: Default behavior. The user is on a different page.
        // We navigate to the new page as usual.
        if (item.path) {
            navigate(item.path);
        }
    };

    const Icon = item.icon;

    return (
        <button
            onClick={handleItemClick}
            className="flex flex-col items-center justify-center w-20 h-full transition-colors duration-300 ease-in-out"
            aria-label={item.label}
        >
            <Icon className={`h-7 w-7 transition-colors duration-300 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`} />
            {isActive && (
                <span className="text-xs mt-1 font-semibold text-yellow-400">
                    {item.label}
                </span>
            )}
        </button>
    );
}