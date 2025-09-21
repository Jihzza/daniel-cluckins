// src/lib/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadPath = `${import.meta.env.BASE_URL}locales/{{lng}}/translation.json`;

try {
  // Basic boot log
  // eslint-disable-next-line no-console
  console.info('[i18n] Boot', {
    mode: process.env.NODE_ENV,
    baseUrl: import.meta.env.BASE_URL,
    loadPath,
  });
} catch {}

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: {
      'pt': ['pt-PT', 'en'], 
      'default': ['en']
    },
    
    debug: process.env.NODE_ENV === 'development',

    // --- SOLUTION IS HERE ---
    // Add 'pt' to the list of supported languages.
    supportedLngs: ['en', 'es', 'pt-PT', 'pt-BR'],
    load: 'currentOnly',

    interpolation: {
      escapeValue: false, 
    },

    backend: {
      loadPath,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
  });

// Lifecycle logs
try {
  // eslint-disable-next-line no-console
  i18n.on('initialized', (opts) => console.info('[i18n] initialized', { lng: i18n.language, opts }));
  // eslint-disable-next-line no-console
  i18n.on('loaded', (loaded) => console.info('[i18n] resources loaded', loaded));
  // eslint-disable-next-line no-console
  i18n.on('failedLoading', (lng, ns, msg) => console.error('[i18n] failed loading', { lng, ns, msg }));
  // eslint-disable-next-line no-console
  i18n.on('missingKey', (lngs, ns, key) => console.warn('[i18n] missing key', { lngs, ns, key }));
  // eslint-disable-next-line no-console
  i18n.on('languageChanged', (lng) => console.info('[i18n] languageChanged', { lng }));
} catch {}

// Keep <html lang> in sync
try {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = i18n.resolvedLanguage || 'en';
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }
} catch {}

// Expose for quick console debugging
try {
  // @ts-ignore
  window.__i18n = i18n;
} catch {}

export default i18n;