// src/pages/SuccessPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#002147]  text-center p-4">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
            <p className="text-gray-600 mt-2">
                Thank you for your payment. Your appointment has been scheduled.
            </p>
            <Link
                to="/"
                className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
                Go to Homepage
            </Link>
        </div>
    );
}