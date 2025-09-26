// Coaching.jsx
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SectionCta from "../../components/ui/SectionCta";
import SectionText from "../../components/ui/SectionText";
import BoxesGrid from "../../components/ui/BoxesGrid";
import BoxesGridText from "../../components/ui/BoxesGridText";
import StepsCarousel from "../../components/ui/StepsCarousel";
// import TierCards from "../../components/coaching/TierCards";
import Button from "../../components/ui/Button";

import SocialMediaIcon from '../../assets/icons/Phone Branco.svg';
import BusinessIcon from '../../assets/icons/Business Branco.svg';
import OnlyFansIcon from '../../assets/icons/OnlyFans Branco.svg';
import DatingIcon from '../../assets/icons/Dating Branco.svg';
import HabitsIcon from '../../assets/icons/Habits Branco.svg';
import StocksIcon from '../../assets/icons/Stocks Branco.svg';
import PersonalTrainerIcon from '../../assets/icons/PersonalTrainer Branco.svg';
import StockResearcherIcon from '../../assets/icons/MoneyBag Branco.svg';

import AnytimeCommsIcon from '../../assets/icons/AnytimeComms Preto.svg';
import ResponseIcon from '../../assets/icons/Response Preto.svg';
import ClassesIcon from '../../assets/icons/Classes Preto.svg';

// Keep prices local; names/descriptions come from i18n
const TIERS = [
  { id: "single", price: 40 },
  { id: "pack5", price: 90 },
  { id: "pack20", price: 230 },
];

export default function Coaching({ onBookCoaching }) {
  const sectionRef = useRef(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const { t } = useTranslation();

  // ⚠️ JSON uses "types" (not "categories")
  const types = t('coaching.types', { returnObjects: true }) || [];
  const typeIcons = [
    StocksIcon,            // Learn How to Invest
    PersonalTrainerIcon,   // Personal Trainer
    DatingIcon,            // Dating Coach
    OnlyFansIcon,          // OnlyFans Coaching
    HabitsIcon,            // Habits & Personal Growth
    SocialMediaIcon,       // Social Media Manager
    BusinessIcon,          // Business Advisor
    StockResearcherIcon,   // Stock Researcher
  ];
  const gridItems = types.map((c, i) => ({
    name: c.title,
    image: typeIcons[i],
    subtitle: c.description,
  }));

  // ⚠️ JSON uses "details" (not "steps")
  const details = t('coaching.details', { returnObjects: true }) || [];
  const stepIcons = [AnytimeCommsIcon, ResponseIcon, ClassesIcon, AnytimeCommsIcon, ResponseIcon, ClassesIcon];
  const steps = details.map((s, i) => ({
    icon: stepIcons[i],
    title: s.title,
    description: s.description,
  }));

  // ⚠️ JSON "tiers" is an ARRAY in the same order as your prices
  const tiersFromI18n = t('coaching.tiers', { returnObjects: true }) || [];
  const enrichedTiers = TIERS.map((tier, idx) => ({
    ...tier,
    planName: tiersFromI18n[idx]?.planName || '',
    planDesc: tiersFromI18n[idx]?.planDesc || '',
  }));

  // Button text — your JSON only has "buttons.default" for now
  const selectedTier = enrichedTiers.find(t => t.id === selectedPlanId) || null;
  const buttonText = selectedTier
    ? `${t('coaching.buttons.default')} - ${selectedTier.price}€${selectedTier.planName ? ` (${selectedTier.planName})` : ''}`
    : t('coaching.buttons.default');
  const onClick = () => onBookCoaching?.(selectedPlanId);

  return (
    <section id="coaching-section"
      ref={sectionRef}
      className="w-full max-w-5xl flex flex-col justify-center items-center mx-auto py-4 space-y-4 md:px-6"
    >

      <SectionText title={t('coaching.title')}>
        {t('coaching.subtitle')}
      </SectionText>

      <BoxesGrid items={gridItems} />

      <StepsCarousel
        steps={steps}
        className="max-w-5xl"
        showNavigation={true}
      />

      <BoxesGridText
        items={enrichedTiers.map(t => ({
          id: t.id,
          label: t.planName,
          paragraph: `${t.price}€`,
          expandedText: `${t.planDesc} ${t.planDesc} ${t.planDesc}`,
        }))}
        onSelectItem={setSelectedPlanId}
      />

      <div className="mt-4">
        <SectionCta sectionRef={sectionRef}>
          <Button onClick={onClick}>
            {buttonText}
          </Button>
        </SectionCta>
      </div>
    </section>
  );
}
