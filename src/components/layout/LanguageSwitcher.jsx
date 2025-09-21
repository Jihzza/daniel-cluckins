// src/components/layout/LanguageSwitcher.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import LanguageButton from '../common/LanguageButton';
import LanguageMenu from './LanguageMenu';
import USFlag from '../../assets/icons/US Flag.svg';
import SpainFlag from '../../assets/icons/Spain Flag.svg';
import PortugalFlag from '../../assets/icons/Portugal Flag.svg';
import BrazilFlag from '../../assets/icons/Brazil Flag.svg';

export default function LanguageSwitcher({ headerRef }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const buttonRef = useRef(null);
  const [currentLang, setCurrentLang] = useState(i18n.resolvedLanguage || i18n.language);
  const prefersReduced = useReducedMotion();

  const languages = [
    { key: 'en', label: 'English', flag: USFlag },
    { key: 'es', label: 'Español', flag: SpainFlag },
    { key: 'pt-PT', label: 'Português PT', flag: PortugalFlag },
    { key: 'pt-BR', label: 'Português BR', flag: BrazilFlag },
  ];

  useEffect(() => {
    const update = () => {
      if (headerRef?.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [headerRef]);

  useEffect(() => {
    const onChange = (lng) => setCurrentLang(lng);
    i18n.on('languageChanged', onChange);
    return () => i18n.off('languageChanged', onChange);
  }, [i18n]);

  const changeLanguage = async (lng) => {
    try {
      await i18n.changeLanguage(lng);
      setCurrentLang(i18n.resolvedLanguage || i18n.language);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[LanguageSwitcher] changeLanguage failed', e);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={buttonRef}>
      <LanguageButton onClick={() => setOpen((v) => !v)} ariaExpanded={open} />
      <LanguageMenu
        open={open}
        topOffset={headerHeight}
        languages={languages}
        currentKey={currentLang}
        onSelect={changeLanguage}
        onRequestClose={() => setOpen(false)}
        anchorRef={buttonRef}
      />
    </div>
  );
}


