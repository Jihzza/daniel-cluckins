// src/components/common/Input.jsx

// This is a reusable text input that can be reused everywhere.

import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// forwardRef -> allows parent libraries (like react-hook-form) to grab the real <input> DOM node
const Input = React.forwardRef(({ 
    className = '', 
    showPasswordToggle = false, 
    showPassword = false, 
    onTogglePassword, 
    ...props 
}, ref) => {
    const isPasswordField = props.type === 'password' || props.type === 'text';
    
    if (showPasswordToggle && isPasswordField) {
        return (
            <div className="relative">
                <input
                    ref={ref}
                    className={`w-full px-3 py-2 pr-10 mt-2 rounded-xl text-white placeholder-gray-400 shadow-lg focus:outline-none bg-[#001B3A] backdrop-blur-md border border-white/20 justify-center items-center flex ${className}`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={onTogglePassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword ? 'true' : 'false'}
                    className="absolute right-3 top-1/2 -translate-y-1/2  w-6 h-6 rounded-md text-white hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer flex items-center justify-center items-center"
                >
                    {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                        <EyeIcon className="h-5 w-5" />
                    )}
                </button>
            </div>
        );
    }

    return (
        <input
            ref={ref}
            className={`w-full px-3 py-2 mt-2 rounded-2xl text-white placeholder-gray-400 shadow-lg focus:outline-none bg-[#001B3A] backdrop-blur-md border border-white/20 justify-center items-center flex ${className}`}
            {...props}
        />
    );
});

Input.displayName = 'Input'; // DevTolls friendliness
export default Input;