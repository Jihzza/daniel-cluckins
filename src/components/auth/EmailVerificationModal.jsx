// src/components/auth/EmailVerificationModal.jsx

// Reusable modal that tells the user to check their inbox

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'; // accessible modal
import { XMarkIcon } from '@heroicons/react/24/outline'; // little "close" icon

/**
 * @param {boolean} open - show / hide state (controlled by parent)
 * @param {Function} onClose - callback when user dismisses the modal
 */
export default function EmailVerificationModal({ open, onClose }) {
    return (
        /* Transition keeps focus traps + fade-in animation */
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                {/* Background overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/50" />
                </Transition.Child>

                {/* Centered panel */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300 scale-95"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md transform rounded-lg bg-white p-6 text-center shadow-xl">
                            {/* close button in the top-right */}
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                                aria-label="Close"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            {/* Body copy */}
                            <Dialog.Title className="text-xl font-semibold text-gray-900">
                                <p className="mt-4 text-gray-600">
                                    We've sent a confirmation link to your email address. Please open it to activate your account.
                                </p>

                                {/* Gmail shortcut */}
                                <a
                                    href="https://mail.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-flex w-full justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Open Gmail
                                </a>

                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="mt-4 inline-flex w-full justify-center gap-2 rounded-md bg-gray-600 px-4 py-2 font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Close
                                </button>
                            </Dialog.Title>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root >
    );
}
