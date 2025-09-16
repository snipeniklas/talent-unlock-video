import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonDE from '../../public/locales/de/common.json';
import commonEN from '../../public/locales/en/common.json';
import solutionsDE from '../../public/locales/de/solutions.json';
import solutionsEN from '../../public/locales/en/solutions.json';

const resources = {
  de: {
    common: commonDE,
    solutions: solutionsDE,
  },
  en: {
    common: commonEN,
    solutions: solutionsEN,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },
    
    supportedLngs: ['de', 'en'],
  });

export default i18n;