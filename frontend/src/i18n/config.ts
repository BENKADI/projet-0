import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import deTranslations from './locales/de.json';
import itTranslations from './locales/it.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: enTranslations,
  },
  fr: {
    common: frTranslations,
  },
  es: {
    common: esTranslations,
  },
  de: {
    common: deTranslations,
  },
  it: {
    common: itTranslations,
  },
} as const;

// Available languages
export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    lng: 'fr', // Default language
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Debug mode (disable in production)
    debug: import.meta.env.DEV,

    // React options
    react: {
      useSuspense: true,
    },
  });

export default i18n;
