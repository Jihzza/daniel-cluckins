// src/pages/sections/SocialMediaSection.jsx

import React from 'react';

// --- COMPONENT IMPORTS ---
import SectionTextBlack from '../../components/common/SectionTextBlack';
import SocialMediaIcon from '../../components/social/SocialMediaIcon';

// --- ICON IMPORTS ---
import InstagramIcon from '../../assets/icons/Instagram.svg';
import TiktokIcon from '../../assets/icons/Tiktok.svg';
import XIcon from '../../assets/icons/X Twitter.svg';

// --- I18N IMPORT ---
import { useTranslation } from 'react-i18next'; // 1. Import the hook

// --- DATA DEFINITION ---
// This static data will be merged with the translated text below.
const staticSocialData = [
    {
        href: 'https://www.instagram.com/danieldagalow/',
        iconSrc: InstagramIcon,
    },
    {
        href: 'https://www.tiktok.com/@galo_portugues?_t=ZG-8xcWPWjcJKS&_r=1',
        iconSrc: TiktokIcon,
    },
    {
        href: 'https://www.x.com/galo_portugues?t=C0UzWJg6Vt7vUpDDMdQslw&s=08',
        iconSrc: XIcon,
    },
];

export default function SocialMediaSection() {
    const { t } = useTranslation(); // 2. Initialize the hook

    // 3. Load translated alt text and merge it with the static icon data.
    // This pattern keeps static assets (like URLs and icons) in code while
    // allowing text content to be managed by the i18n system.
    const translatedLinks = t('socialMedia.links', { returnObjects: true });
    const socialLinks = staticSocialData.map((social, index) => ({
        ...social,
        altText: translatedLinks[index]?.altText || `Social media link ${index + 1}`
    }));

    return (
        <section id="social-media-section" className="max-w-4xl mx-auto py-8 text-center">

            {/* 4. SECTION TITLE */}
            {/* The title is now fetched from the translation file. */}
            <SectionTextBlack title={t('socialMedia.title')} />

            <div className="flex justify-center items-center gap-6">
                {/* 5. We map over the newly merged `socialLinks` array. */}
                {socialLinks.map((social, index) => (
                    <SocialMediaIcon
                        key={index}
                        href={social.href}
                        iconSrc={social.iconSrc}
                        // The altText is now dynamic and translated.
                        altText={social.altText}
                    />
                ))}
            </div>

        </section>
    );
}