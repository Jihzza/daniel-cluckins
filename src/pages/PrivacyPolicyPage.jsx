// src/pages/PrivacyPolicyPage.jsx

import React from 'react';
import { useTranslation } from 'react-i18next'; // 1. Import hook
import ProfileSectionLayout from '../components/profile/ProfileSectionLayout';
import SectionTextWhite from '../components/common/SectionTextWhite';

// 2. Create a helper to render different content types
const renderContent = (item, index) => {
  switch (item.type) {
    case 'h4':
      return <h4 key={index}>{item.text}</h4>;
    case 'p':
      return <p key={index}>{item.text}</p>;
    case 'ul':
      return (
        <ul key={index}>
          {item.items.map((li, i) => <li key={i}>{li}</li>)}
        </ul>
      );
    default:
      return null;
  }
};

export default function PrivacyPolicyPage() {
  const { t } = useTranslation(); // 3. Initialize hook

  // 4. Load the entire page structure from the translation file
  const pageContent = t('privacyPolicy', { returnObjects: true });

  return (
    <div className="bg-[#002147] ">
      <ProfileSectionLayout>
        <SectionTextWhite title={pageContent.title} />
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 p-6 md:p-8 prose prose-sm md:prose-base max-w-none">
          <p className="lead">{pageContent.lead}</p>

          {/* 5. Map over the content array and render each item */}
          {pageContent.content?.map(renderContent)}
        </div>
      </ProfileSectionLayout>
    </div>
  );
};