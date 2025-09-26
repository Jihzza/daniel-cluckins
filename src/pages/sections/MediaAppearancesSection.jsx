// src/components/sections/media/MediaAppearancesSection.jsx
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import SectionTextBlack from "../../components/common/SectionTextBlack"; // adjust path if needed
import MediaAppearances from "../../assets/images/MediaAppearances.png"; // hero image
import { mediaItems } from "../../components/mediaAppearances/mediaItems";
import MediaGrid from "../../components/mediaAppearances/MediaGrid";


export default function MediaAppearancesSection() {
    const { t } = useTranslation();


    // Merge static items with localized labels/alt text.
    const localized = useMemo(
        () =>
            mediaItems.map((m) => ({
                ...m,
                alt: t(`media.links.${m.id}.alt`, { defaultValue: m.fallbackAlt }),
                label: t(`media.links.${m.id}.label`, { defaultValue: "" })
            })),
        [t]
    );


    return (
        <section id="media-appearances-section" className="w-full mx-auto py-6 text-center md:px-6">
            <SectionTextBlack title={t('mediaAppearances.title')}>
                {t('mediaAppearances.subtitle')}
            </SectionTextBlack>


            <div className="my-8 px-4">
                <img
                    src={MediaAppearances}
                    alt={t("media.mainImageAlt", { defaultValue: "Aparições na mídia" })}
                    className="w-60 max-w-3xl mx-auto md:w-80 lg:w-60 text-shadow-lg"
                    loading="lazy"
                    decoding="async"
                />
            </div>


            <div className="px-6 mt-8 self-center">
                <MediaGrid items={localized} />
            </div>
        </section>
    );
}