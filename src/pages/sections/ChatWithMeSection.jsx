// src/pages/sections/ChatWithMeSection.jsx
import React from 'react';
import SectionTextBlack from '../../components/common/SectionTextBlack';
import Button from '../../components/ui/Button';
import InfoBlock from '../../components/common/InfoBlock';
import ChatIcon from '../../assets/icons/Dagalow Yellow.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // <— add this

export default function ChatWithMeSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();              // <— and this

  return (
    <section className="max-w-4xl mx-auto py-4 text-center space-y-6 md:px-6" id="chat-section">
      <SectionTextBlack title={t('chatWithMe.title')}>
        {t('chatWithMe.subtitle')}
      </SectionTextBlack>

      <InfoBlock iconSrc={ChatIcon} altText={t('chatWithMe.iconAltText')}>
        {t('chatWithMe.iconLabel')}
      </InfoBlock>

      <Button onClick={() => navigate('/chatbot')}>
        {t('chatWithMe.buttonText')}
      </Button>

      {/* Chatbot temporarily disabled */}
    </section>
  );
}
