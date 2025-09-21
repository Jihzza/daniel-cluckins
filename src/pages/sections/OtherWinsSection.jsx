// src/pages/sections/OtherWinsSection.jsx
import React from "react";
import SectionTextBlack from "../../components/common/SectionTextBlack";
import ImageCarousel from "../../components/carousel/ImageCarousel";
import FullScreenVideo from "../../components/video/FullScreenVideo";
import { useTranslation } from "react-i18next";
import TransformationVideo from "../../assets/video/BodyTransformation.mp4";
// (Optional) import a poster image if you have one
// import Poster from "../../assets/video/BodyTransformationPoster.jpg";

export default function OtherWinsSection() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto flex w-full flex-col text-center md:px-6 py-4 md:py-4">
      {/* Title + subtitle */}
      <SectionTextBlack title={t("otherWins.title")}>
        {t("otherWins.bodyTransformation")}
      </SectionTextBlack>

      {/* Video */}
      <div className="w-full mx-auto">
        <div className="mx-auto flex w-full max-w-md items-center justify-center">
          <FullScreenVideo
            src={TransformationVideo}
            // poster={Poster}
            autoPlay={true}
            muted={true}
            className="self-center rounded-xl mt-6 w-45 md:w-55 lg:w-45"
          />
        </div>
      </div>

      {/* Social media description */}
      <div className="w-full mx-auto">
        <div className="mx-auto max-w-4xl">
          <SectionTextBlack>{t("otherWins.socialMedia")}</SectionTextBlack>
        </div>
      </div>

      {/* Carousel */}
      <div className="full-bleed py-8">
        <div className="desktop-fade-container mx-auto w-full lg:w-[70%] lg:max-w-6xl">
          <ImageCarousel />
        </div>
      </div>
    </section>
  );
}
