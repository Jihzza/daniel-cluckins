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
import { useTranslation } from 'react-i18next';

// --- DATA DEFINITION ---
const staticSocialData = [
  {
    href: 'https://www.instagram.com/danieldagalow/',
    iconSrc: InstagramIcon,
    key: 'instagram',
  },
  {
    href: 'https://www.tiktok.com/@galo_portugues?_t=ZG-8xcWPWjcJKS&_r=1',
    iconSrc: TiktokIcon,
    key: 'tiktok',
  },
  {
    href: 'https://www.x.com/galo_portugues?t=C0UzWJg6Vt7vUpDDMdQslw&s=08',
    iconSrc: XIcon,
    key: 'x',
  },
];

export default function SocialMediaSection() {
  const { t } = useTranslation();

  // Expecting translation like:
  // socialMedia.links = [
  //   { altText: "...", label: "Instagram" },
  //   { altText: "...", label: "TikTok" },
  //   { altText: "...", label: "X (Twitter)" }
  // ]
  const translatedLinks = t('socialMedia.links', { returnObjects: true }) || [];

  const socialLinks = staticSocialData.map((social, index) => {
    const i18n = translatedLinks[index] || {};
    // Fallback label if i18n label not provided
    const fallbackLabel =
      social.key === 'instagram' ? 'Instagram' :
      social.key === 'tiktok' ? 'TikTok' :
      social.key === 'x' ? 'X (Twitter)' :
      'Social';
    return {
      ...social,
      altText: i18n.altText || `${fallbackLabel} link`,
      label: i18n.label || fallbackLabel,
    };
  });

  return (
    <section className="max-w-4xl mx-auto py-8 text-center">
      <SectionTextBlack title={t('socialMedia.title')} />

      {/* Linktree-style vertical stack */}
      <div className="mx-auto w-full max-w-md flex flex-col items-stretch gap-4">
        {socialLinks.map((social, index) => (
          <SocialMediaIcon
            key={index}
            href={social.href}
            iconSrc={social.iconSrc}
            altText={social.altText}
            label={social.label}
          />
        ))}
      </div>
    </section>
  );
}
