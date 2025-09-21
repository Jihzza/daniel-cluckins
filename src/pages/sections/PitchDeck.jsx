// PitchDeck.jsx
import { useRef } from "react";
import SectionCta from "../../components/ui/SectionCta";
import SectionText from "../../components/ui/SectionText";
import PitchDeckGrid from "../../components/ui/PitchDeckGrid";
import Button from "../../components/ui/Button";
import { useTranslation } from 'react-i18next';
import PerspetivBanner from '../../assets/images/Perspectiv Banner.svg';
import GalowClubBanner from '../../assets/images/Galow Banner.svg';
import Perspectiv_Logo from '../../assets/icons/Perspectiv.svg';
import GalowClub_Logo from '../../assets/icons/GalowClub.svg';

export default function PitchDeck({ onBookPitchDeck }) {
    const sectionRef = useRef(null);
    const { t } = useTranslation();

    // Transform pitch deck data to match BoxesGrid format
    const pitchDecks = t('pitchDeck.decks', { returnObjects: true }).map((deck, index) => ({
        name: deck.title,
        image: [Perspectiv_Logo, GalowClub_Logo][index], // Box images - logos
        expandedImage: [PerspetivBanner, GalowClubBanner][index], // Expanded description images - banners
        subtitle: deck.description,
        id: ['perspetiv', 'galowclub'][index]
    }));

    return (
        <section ref={sectionRef} className="w-full max-w-5xl flex flex-col justify-center items-center mx-auto py-4 space-y-4 md:px-6">
            <SectionText title={t('pitchDeck.investTitle')}>
                {t('pitchDeck.investSubtitle')}
            </SectionText>

            <PitchDeckGrid
                items={pitchDecks}
                showLabels={true}
                imageSize="w-13 h-13"
                fixedHeight={true}
                showExpandedImage={true}
            />

            <div className="mt-6">
                <SectionCta sectionRef={sectionRef}>
                    <Button onClick={onBookPitchDeck}>{t('pitchDeck.buttonText')}</Button>
                </SectionCta>
            </div>
        </section>
    );
}