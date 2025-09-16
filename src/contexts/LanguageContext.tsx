import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations object
const translations = {
  de: {
    'navigation.home': 'Startseite',
    'navigation.solutions': 'RaaS Lösungen',
    'navigation.howWeWork': 'So arbeiten wir',
    'navigation.aboutUs': 'Über uns',
    'navigation.resourceHub': 'RaaS Hub',
    'navigation.contact': 'Kontakt',
    'navigation.login': 'Login',
    'navigation.createRequest': 'RaaS Anfrage erstellen',
    'navigation.createRequestShort': 'RaaS Anfrage',
    'footer.company': 'Unternehmen',
    'footer.solutions': 'Lösungen',
    'footer.contact': 'Kontakt',
    'footer.legal': 'Rechtliches',
    'footer.followUs': 'Folgen Sie uns',
    'footer.backoffice': 'Remote Backoffice',
    'footer.itDevelopment': 'IT Development',
    'footer.aiml': 'AI/ML',
    'footer.aboutUs': 'Über uns',
    'footer.howWeWork': 'So arbeiten wir',
    'footer.resourceHub': 'RaaS Hub',
    'footer.privacy': 'Datenschutz',
    'footer.imprint': 'Impressum',
    'footer.copyright': '© 2024 Hej Talent. Alle Rechte vorbehalten.',
    'benefits.cheaper': '30 % günstiger',
    'benefits.onboarding': 'Onboarding in 2-4 Wochen',
    'benefits.verified': 'Geprüfte Remote-Fachkräfte',
    'benefits.noHeadhunterFee': 'Keine Headhunter-Fee',
    'benefits.gdprCompliant': 'Remote & DSGVO-konform',
    'benefits.scalable': 'Skalierung jederzeit möglich',
    'benefits.noRecruiting': 'Kein Recruiting-Aufwand',
    'benefits.timezoneCompatible': 'Zeitzonen-kompatibel',
    'benefits.available247': 'Dienstleistungen 24/7 an 365 Tagen möglich',
    'solutions.overview.title': 'Unsere RaaS Lösungen',
    'solutions.overview.subtitle': 'Entdecken Sie die verschiedenen Kategorien von Remote-Fachkräften, die wir anbieten',
    'solutions.overview.backoffice.title': 'Remote Backoffice',
    'solutions.overview.backoffice.description': 'Professionelle Unterstützung für Ihre administrativen Aufgaben',
    'solutions.overview.itDevelopment.title': 'IT Development',
    'solutions.overview.itDevelopment.description': 'Erfahrene Entwickler für Ihre digitalen Projekte',
    'solutions.overview.aiml.title': 'AI/ML',
    'solutions.overview.aiml.description': 'KI-Experten für innovative Lösungen',
    'solutions.overview.cta.title': 'Bereit für den nächsten Schritt?',
    'solutions.overview.cta.subtitle': 'Buchen Sie eine kostenlose Beratung und erfahren Sie, wie unsere Remote-Talente Ihr Unternehmen voranbringen können.',
    'solutions.overview.cta.button': 'Kostenlose Beratung buchen'
  },
  en: {
    'navigation.home': 'Home',
    'navigation.solutions': 'RaaS Solutions',
    'navigation.howWeWork': 'How We Work',
    'navigation.aboutUs': 'About Us',
    'navigation.resourceHub': 'RaaS Hub',
    'navigation.contact': 'Contact',
    'navigation.login': 'Login',
    'navigation.createRequest': 'Create RaaS Request',
    'navigation.createRequestShort': 'RaaS Request',
    'footer.company': 'Company',
    'footer.solutions': 'Solutions',
    'footer.contact': 'Contact',
    'footer.legal': 'Legal',
    'footer.followUs': 'Follow Us',
    'footer.backoffice': 'Remote Backoffice',
    'footer.itDevelopment': 'IT Development',
    'footer.aiml': 'AI/ML',
    'footer.aboutUs': 'About Us',
    'footer.howWeWork': 'How We Work',
    'footer.resourceHub': 'RaaS Hub',
    'footer.privacy': 'Privacy Policy',
    'footer.imprint': 'Imprint',
    'footer.copyright': '© 2024 Hej Talent. All rights reserved.',
    'benefits.cheaper': '30% cheaper',
    'benefits.onboarding': 'Onboarding in 2-4 weeks',
    'benefits.verified': 'Verified remote specialists',
    'benefits.noHeadhunterFee': 'No headhunter fee',
    'benefits.gdprCompliant': 'Remote & GDPR compliant',
    'benefits.scalable': 'Scaling possible anytime',
    'benefits.noRecruiting': 'No recruiting effort',
    'benefits.timezoneCompatible': 'Timezone compatible',
    'benefits.available247': 'Services 24/7, 365 days available',
    'solutions.overview.title': 'Our RaaS Solutions',
    'solutions.overview.subtitle': 'Discover the different categories of remote specialists we offer',
    'solutions.overview.backoffice.title': 'Remote Backoffice',
    'solutions.overview.backoffice.description': 'Professional support for your administrative tasks',
    'solutions.overview.itDevelopment.title': 'IT Development',
    'solutions.overview.itDevelopment.description': 'Experienced developers for your digital projects',
    'solutions.overview.aiml.title': 'AI/ML',
    'solutions.overview.aiml.description': 'AI experts for innovative solutions',
    'solutions.overview.cta.title': 'Ready for the next step?',
    'solutions.overview.cta.subtitle': 'Book a free consultation and learn how our remote talents can advance your business.',
    'solutions.overview.cta.button': 'Book Free Consultation'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [language, setLanguageState] = useState<Language>('de');

  // Detect language from URL
  useEffect(() => {
    const pathLanguage = location.pathname.startsWith('/en') ? 'en' : 'de';
    setLanguageState(pathLanguage);
  }, [location.pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};