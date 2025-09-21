// src/components/profile/ProfileSectionLayout.jsx
import React from 'react';

/**
 * A reusable layout component for all profile subpages, styled for a consistent dark theme.
 *
 * @param {string} title - The title to be displayed at the top of the page.
 * @param {React.ReactNode} children - The unique content for each page.
 */
const ProfileSectionLayout = ({ children }) => {
    return (
        // The container is now set for a dark theme, with white text as the default.
        // It remains within the same max-width for consistency.
        <div className="max-w-4xl mx-auto p-6 lg:p-8 text-black">

            <main>
                {children}
            </main>
        </div>
    );
};

export default ProfileSectionLayout;