// src/pages/sections/ChatWithMeSection.jsx
import React from 'react';
import SectionTextBlack from '../../components/common/SectionTextBlack';
import InfoBlock from '../../components/common/InfoBlock';
import ChatIcon from '../../assets/icons/Dagalow Yellow.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ChatWithMeSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goToChat = () => navigate('/chatbot'); // programmatic navigation

  return (
    <section id="chat-section" className="max-w-4xl mx-auto py-4 text-center space-y-6 md:px-6">
      <SectionTextBlack title={t('chatWithMe.title')}>
        {t('chatWithMe.subtitle')}
      </SectionTextBlack>

      <InfoBlock
        iconSrc={ChatIcon}
        altText={t('chatWithMe.iconAltText')}
        ariaLabel={t('chatWithMe.buttonText')} // optional, improves SR label
        onClick={goToChat}
      >
        {t('chatWithMe.iconLabel')}
      </InfoBlock>

      {/* Chatbot temporarily disabled */}
    </section>
  );
}
