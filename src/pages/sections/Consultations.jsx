// src/sections/consultations/Consultations.jsx

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import SectionCta from "../../components/ui/SectionCta";
import SectionText from "../../components/ui/SectionText";
import BoxesGrid from "../../components/ui/BoxesGrid";
import StepsCarousel from "../../components/ui/StepsCarousel";
import Button from "../../components/ui/Button";

import MindsetIcon from '../../assets/icons/Brain Branco.svg';
import SocialMediaIcon from '../../assets/icons/Phone Branco.svg';
import FinanceIcon from '../../assets/icons/MoneyBag Branco.svg';
import MarketingIcon from '../../assets/icons/Target Branco.svg';
import BusinessIcon from '../../assets/icons/Bag Branco.svg';
import RelationshipsIcon from '../../assets/icons/Heart Branco.svg';
import HealthIcon from '../../assets/icons/Fitness Branco.svg';
import OnlyFansIcon from '../../assets/icons/Onlyfans Branco.svg';
import AITechIcon from '../../assets/icons/Robot Branco.svg';
import LifeAdviceIcon from '../../assets/icons/More Branco.svg';

import Face2FaceIcon from '../../assets/icons/Face2Face Preto.svg';
import DurationIcon from '../../assets/icons/Clock Preto.svg';
import RecordingIcon from '../../assets/icons/Microphone Preto.svg';
import FollowUpEmailIcon from '../../assets/icons/Email Preto.svg';
import FollowUpConsultationIcon from '../../assets/icons/FollowUp Preto.svg';

export default function Consultations({ onBookConsultation }) {
  const sectionRef = useRef(null);
  const { t } = useTranslation();

  // 1) Grid items (10 types) — read array from i18n and attach icons by index
  const types = t('consultations.types', { returnObjects: true }) || [];
  const typeIcons = [
    MindsetIcon,        // Mindset & Psychology
    SocialMediaIcon,    // Social Media Growth
    FinanceIcon,        // Finance & Wealth
    MarketingIcon,      // Marketing & Sales
    BusinessIcon,       // Business Building
    RelationshipsIcon,  // Relationships
    HealthIcon,         // Health & Fitness
    OnlyFansIcon,       // OnlyFans
    AITechIcon,         // AI & Tech
    LifeAdviceIcon,     // Life Advice
  ];

  const gridItems = types.map((type, i) => ({
    name: type.title,
    image: typeIcons[i],
    subtitle: type.description,
  }));

  // 2) Steps/details (5 items) — read array from i18n and attach icons by index
  const details = t('consultations.details', { returnObjects: true }) || [];
  const stepIcons = [
    Face2FaceIcon,          // Face-to-Face Video Call
    DurationIcon,           // Minimum 45-Minute Sessions
    RecordingIcon,          // Session Recordings
    FollowUpEmailIcon,      // Follow-up Email
    FollowUpConsultationIcon, // Follow-up Consultation
  ];
  const steps = details.map((d, i) => ({
    icon: stepIcons[i],
    title: d.title,
    description: d.description,
  }));

  return (
    <section id="consultations-section"
      ref={sectionRef}
      className="w-full max-w-5xl flex flex-col justify-center items-center mx-auto py-4 space-y-4 md:px-6"
    >

      <SectionText title={t('consultations.title')}>
        {t('consultations.subtitle')}
      </SectionText>

      <BoxesGrid items={gridItems} />

      <StepsCarousel
        steps={steps}
        className="max-w-5xl"
        showNavigation={true}
      />

      <SectionCta sectionRef={sectionRef}>
        <Button onClick={onBookConsultation}>
          {t('consultations.buttons.default')}
        </Button>
      </SectionCta>
    </section>
  );
}
