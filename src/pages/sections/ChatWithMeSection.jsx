// src/pages/sections/ChatWithMeSection.jsx
import React, { useEffect, useRef } from 'react';
import SectionTextBlack from '../../components/common/SectionTextBlack';
import InfoBlock from '../../components/common/InfoBlock';
import ChatIcon from '../../assets/icons/Dagalow Yellow.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ChatWithMeSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // Navigate to the chatbot page
  const goToChat = () => navigate('/chatbot');

  // Dispatch a custom event when this section is prominently visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio > 0.5;
        // Send visibility state to the NavigationBar (where you toggle .chat-icon-glow)
        window.dispatchEvent(new CustomEvent('chatSectionVisible', { detail: visible }));
      },
      { threshold: [0, 0.5, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="chat-section"
      aria-labelledby="chat-section-title"
      className="max-w-4xl mx-auto py-8 md:py-12 text-center space-y-8 md:px-6"
      data-section="chat-with-me"
    >
      {/* Title + description (uses your i18n keys; will show the key as text if missing) */}
      <div className="px-4">
        <SectionTextBlack
          id="chat-section-title"
          title={t('chatWithMe.title')}
          subtitle={t('chatWithMe.subtitle')}
          description={t('chatWithMe.description')}
        />
      </div>

      {/* CTA / Info block that routes to /chatbot */}
      <div className="flex items-center justify-center">
        <InfoBlock
          iconSrc={ChatIcon}
          altText={t('chatWithMe.iconAltText')}
          ariaLabel={t('chatWithMe.buttonText')}
          onClick={goToChat}
        >
          {t('chatWithMe.iconLabel')}
        </InfoBlock>
      </div>
    </section>
  );
}
