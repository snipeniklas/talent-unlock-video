import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Comprehensive translations object
const translations = {
  de: {
    // Navigation
    'navigation.home': 'Startseite',
    'navigation.solutions': 'RaaS Lösungen',
    'navigation.howWeWork': 'So arbeiten wir',
    'navigation.aboutUs': 'Über uns',
    'navigation.resourceHub': 'RaaS Hub',
    'navigation.contact': 'Kontakt',
    'navigation.login': 'Login',
    'navigation.createRequest': 'RaaS Anfrage erstellen',
    'navigation.createRequestShort': 'RaaS Anfrage',
    
    // Footer
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
    
    // Benefits Banner
    'benefits.cheaper': '30 % günstiger',
    'benefits.onboarding': 'Onboarding in 2-4 Wochen',
    'benefits.verified': 'Geprüfte Remote-Fachkräfte',
    'benefits.noHeadhunterFee': 'Keine Headhunter-Fee',
    'benefits.gdprCompliant': 'Remote & DSGVO-konform',
    'benefits.scalable': 'Skalierung jederzeit möglich',
    'benefits.noRecruiting': 'Kein Recruiting-Aufwand',
    'benefits.timezoneCompatible': 'Zeitzonen-kompatibel',
    'benefits.available247': 'Dienstleistungen 24/7 an 365 Tagen möglich',
    
    // Solutions Overview
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
    'solutions.overview.cta.button': 'Kostenlose Beratung buchen',
    
    // HomePage - Hero Section
    'hero.badge.expertise': '9+ Jahre Remote-Expertise',
    'hero.badge.specialists': '500+ geprüfte Fachkräfte',
    'hero.badge.success': '98% Erfolgsquote',
    'hero.badge.guarantee': 'Qualitätsgarantie',
    'hero.title': 'RaaS - Resources as a Service',
    'hero.subtitle': 'Die Remote-Experten, die Ihre Herausforderungen verstehen und lösen.',
    'hero.description': 'Als führender Dienstleister für internationale Fachkräfte stellen wir Ihnen seit 9 Jahren die besten Talente zur Verfügung. Unser bewährtes RaaS-System macht es einfach: Sie beschreiben Ihr Problem, wir liefern die perfekte Fachkraft-Lösung.',
    'hero.cta.main': 'Unverbindliche RaaS Anfrage starten',
    'hero.cta.secondary': 'Oder entdecken Sie unsere Expertise →',
    'hero.video.title': 'Hej Talent Intro Video',
    'hero.riskFree.title': '✅ 100% kostenfrei & unverbindlich starten',
    'hero.riskFree.description': 'Erhalten Sie maßgeschneiderte Ressourcen-Vorschläge ohne jegliche Verpflichtung. Erst bei Ihrer Zustimmung beginnt die Zusammenarbeit.',
    'hero.trust.text': 'Vertrauen Sie auf 9+ Jahre Expertise:',
    'hero.trust.international': 'Internationale Kunden',
    'hero.trust.gdpr': 'DSGVO-konform',
    'hero.trust.iso': 'ISO 27001',
    
    // HomePage - Services
    'services.backoffice.title': 'Remote Backoffice-Fachkräfte',
    'services.backoffice.description': 'Qualifizierte Remote-Mitarbeiter für Administration, Buchhaltung und operative Unterstützung',
    'services.it.title': 'Remote IT-Entwickler & Tech-Experten',
    'services.it.description': 'Erfahrene Remote-Entwickler für Full-Stack, DevOps und Softwarearchitektur',
    'services.aiml.title': 'Remote KI & ML-Spezialisten',
    'services.aiml.description': 'KI-Experten und Data Scientists für Machine Learning und AI-Projekte',
    'services.cta.button': 'Jetzt starten',
    
    // HomePage - Stats
    'stats.title': 'Marktführer für Remote-Recruiting seit 2020',
    'stats.subtitle': 'Zahlen, die unsere Expertise beweisen',
    'stats.award': '🏆 Ausgezeichnet als "Best Remote Recruiting Platform 2023"',
    'stats.awardDescription': 'Über 150 Unternehmen vertrauen bereits auf unsere bewährte RaaS-Methodik. Von Startups bis DAX-Konzerne - wir finden die passenden Remote-Experten.',
    'stats.specialists': 'Vermittelte Remote-Fachkräfte',
    'stats.placements': 'Erfolgreiche Vermittlungen',
    'stats.satisfaction': 'Zufriedene Unternehmen',
    'stats.time': 'Wochen Besetzungszeit',
    'stats.cta.title': 'Ihre kostenfreie RaaS Anfrage dauert nur 3 Minuten',
    'stats.cta.description': 'Beschreiben Sie Ihre Herausforderung, wir schlagen Ihnen passende Experten vor. Kein Risiko, keine versteckten Kosten.',
    'stats.cta.button': 'Jetzt kostenfrei starten',
    
    // Contact Page
    'contact.title': 'Kontakt & Erstgespräch',
    'contact.subtitle': 'Lassen Sie uns über Ihre Remote-Fachkräfte-Anforderungen sprechen',
    'contact.speakToUs': 'Sprechen Sie uns an',
    'contact.email': 'E-Mail',
    'contact.phone': 'Telefon',
    'contact.address': 'Adresse',
    'contact.businessHours': 'Geschäftszeiten',
    'contact.businessHoursValue': 'Mo-Fr 9:00-18:00 Uhr',
    'contact.form.title': 'Suchauftrag kostenlos erstellen',
    'contact.form.firstName': 'Vorname',
    'contact.form.lastName': 'Nachname',
    'contact.form.email': 'E-Mail-Adresse',
    'contact.form.company': 'Unternehmen',
    'contact.form.phone': 'Telefon',
    'contact.form.description': 'Beschreiben Sie Ihren Remote-Fachkräfte-Bedarf...',
    'contact.form.submit': 'Suchauftrag kostenlos erstellen',
    
    // About Us Page
    'about.title': 'Über Hej Talent',
    'about.subtitle': 'Seit 2020 sind wir Deutschlands führende Plattform für internationale Remote-Fachkräfte. Wir verbinden Unternehmen mit den besten Talenten weltweit.',
    'about.mission.title': 'Unsere Mission',
    'about.mission.description1': 'Wir machen internationale Expertise für deutsche Unternehmen zugänglich. Unser Resources as a Service (RaaS) Modell revolutioniert die Art, wie Unternehmen auf Fachkräfte zugreifen.',
    'about.mission.description2': 'Statt langwieriger Einstellungsprozesse bieten wir flexible Dienstleistungsverträge mit geprüften Remote-Experten aus über 15 Ländern.',
    'about.mission.specialists': '500+ internationale Fachkräfte',
    'about.mission.projects': '150+ erfolgreiche Projekte',
    'about.mission.satisfaction': '98% Kundenzufriedenheit',
    'about.values.international.title': 'Internationale Expertise',
    'about.values.international.description': 'Wir verbinden deutsche Unternehmen mit den besten internationalen Talenten weltweit.',
    'about.values.quality.title': 'Geprüfte Qualität',
    'about.values.quality.description': 'Jede Remote-Fachkraft durchläuft unseren mehrstufigen Qualifizierungsprozess.',
    'about.values.speed.title': 'Schnelle Vermittlung',
    'about.values.speed.description': 'Von der Anfrage bis zur Integration in nur 2-4 Wochen.',
    'about.values.success.title': 'Messbare Erfolge',
    'about.values.success.description': '98% Kundenzufriedenheit und über 90% Projektfortführungsrate.',
    'about.founders.title': 'Über uns - Joachim & Pascal',
    'about.founder.joachim.name': 'Joachim Kalff',
    'about.founder.joachim.role': 'Gründer & Geschäftsführer',
    'about.founder.pascal.name': 'Pascal Spieß',
    'about.founder.pascal.role': 'Consultant',
    'about.timeline.title': 'Unsere Entwicklung seit 2020',
    'about.international.title': 'Warum internationale Fachkräfte?',
    'about.international.subtitle': 'Der deutsche Fachkräftemangel erfordert neue Lösungen. Unsere internationalen Remote-Experten bieten nicht nur kostengünstige Alternativen, sondern auch frische Perspektiven und Expertise aus globalen Märkten.',
    'about.international.savings.title': 'Kosteneinsparung',
    'about.international.savings.description': 'Durchschnittliche Ersparnis gegenüber lokalen Vollzeitkräften',
    'about.international.countries.title': 'Länder',
    'about.international.countries.description': 'Internationale Expertise aus verschiedenen Zeitzonen',
    'about.international.availability.title': 'Verfügbarkeit',
    'about.international.availability.description': 'Kontinuierliche Produktivität durch globale Zeitzone-Abdeckung',
    'about.cta.title': 'Bereit für internationale Verstärkung?',
    'about.cta.subtitle': 'Entdecken Sie, wie unsere internationalen Remote-Fachkräfte Ihr Unternehmen voranbringen können.',
    'about.cta.button': 'Kostenlose RaaS Anfrage starten',
    
    // Common CTAs
    'cta.free': 'KOSTENFREI',
    'common.startNow': 'Jetzt starten',
    'common.learnMore': 'Mehr erfahren'
  },
  en: {
    // Navigation
    'navigation.home': 'Home',
    'navigation.solutions': 'RaaS Solutions',
    'navigation.howWeWork': 'How We Work',
    'navigation.aboutUs': 'About Us',
    'navigation.resourceHub': 'RaaS Hub',
    'navigation.contact': 'Contact',
    'navigation.login': 'Login',
    'navigation.createRequest': 'Create RaaS Request',
    'navigation.createRequestShort': 'RaaS Request',
    
    // Footer
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
    
    // Benefits Banner
    'benefits.cheaper': '30% cheaper',
    'benefits.onboarding': 'Onboarding in 2-4 weeks',
    'benefits.verified': 'Verified remote specialists',
    'benefits.noHeadhunterFee': 'No headhunter fee',
    'benefits.gdprCompliant': 'Remote & GDPR compliant',
    'benefits.scalable': 'Scaling possible anytime',
    'benefits.noRecruiting': 'No recruiting effort',
    'benefits.timezoneCompatible': 'Timezone compatible',
    'benefits.available247': 'Services 24/7, 365 days available',
    
    // Solutions Overview
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
    'solutions.overview.cta.button': 'Book Free Consultation',
    
    // HomePage - Hero Section
    'hero.badge.expertise': '9+ Years Remote Expertise',
    'hero.badge.specialists': '500+ verified specialists',
    'hero.badge.success': '98% Success Rate',
    'hero.badge.guarantee': 'Quality Guarantee',
    'hero.title': 'RaaS - Resources as a Service',
    'hero.subtitle': 'The remote experts who understand and solve your challenges.',
    'hero.description': 'As a leading provider of international specialists, we have been providing you with the best talent for 9 years. Our proven RaaS system makes it simple: you describe your problem, we deliver the perfect specialist solution.',
    'hero.cta.main': 'Start non-binding RaaS request',
    'hero.cta.secondary': 'Or discover our expertise →',
    'hero.video.title': 'Hej Talent Intro Video',
    'hero.riskFree.title': '✅ 100% free & non-binding start',
    'hero.riskFree.description': 'Receive customized resource suggestions without any obligation. Collaboration only begins with your approval.',
    'hero.trust.text': 'Trust in 9+ years of expertise:',
    'hero.trust.international': 'International clients',
    'hero.trust.gdpr': 'GDPR compliant',
    'hero.trust.iso': 'ISO 27001',
    
    // HomePage - Services
    'services.backoffice.title': 'Remote Backoffice Specialists',
    'services.backoffice.description': 'Qualified remote employees for administration, accounting and operational support',
    'services.it.title': 'Remote IT Developers & Tech Experts',
    'services.it.description': 'Experienced remote developers for full-stack, DevOps and software architecture',
    'services.aiml.title': 'Remote AI & ML Specialists',
    'services.aiml.description': 'AI experts and data scientists for machine learning and AI projects',
    'services.cta.button': 'Get Started',
    
    // HomePage - Stats
    'stats.title': 'Market leader for remote recruiting since 2020',
    'stats.subtitle': 'Numbers that prove our expertise',
    'stats.award': '🏆 Awarded as "Best Remote Recruiting Platform 2023"',
    'stats.awardDescription': 'Over 150 companies already trust our proven RaaS methodology. From startups to DAX corporations - we find the right remote experts.',
    'stats.specialists': 'Placed Remote Specialists',
    'stats.placements': 'Successful Placements',
    'stats.satisfaction': 'Satisfied Companies',
    'stats.time': 'Weeks Placement Time',
    'stats.cta.title': 'Your free RaaS request takes only 3 minutes',
    'stats.cta.description': 'Describe your challenge, we suggest suitable experts. No risk, no hidden costs.',
    'stats.cta.button': 'Start free now',
    
    // Contact Page
    'contact.title': 'Contact & Initial Consultation',
    'contact.subtitle': 'Let\'s talk about your remote specialist requirements',
    'contact.speakToUs': 'Contact Us',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.address': 'Address',
    'contact.businessHours': 'Business Hours',
    'contact.businessHoursValue': 'Mon-Fri 9:00-18:00',
    'contact.form.title': 'Create search request for free',
    'contact.form.firstName': 'First Name',
    'contact.form.lastName': 'Last Name',
    'contact.form.email': 'Email Address',
    'contact.form.company': 'Company',
    'contact.form.phone': 'Phone',
    'contact.form.description': 'Describe your remote specialist needs...',
    'contact.form.submit': 'Create search request for free',
    
    // About Us Page
    'about.title': 'About Hej Talent',
    'about.subtitle': 'Since 2020, we are Germany\'s leading platform for international remote specialists. We connect companies with the best talent worldwide.',
    'about.mission.title': 'Our Mission',
    'about.mission.description1': 'We make international expertise accessible for German companies. Our Resources as a Service (RaaS) model revolutionizes how companies access specialists.',
    'about.mission.description2': 'Instead of lengthy hiring processes, we offer flexible service contracts with verified remote experts from over 15 countries.',
    'about.mission.specialists': '500+ international specialists',
    'about.mission.projects': '150+ successful projects',
    'about.mission.satisfaction': '98% customer satisfaction',
    'about.values.international.title': 'International Expertise',
    'about.values.international.description': 'We connect German companies with the best international talent worldwide.',
    'about.values.quality.title': 'Verified Quality',
    'about.values.quality.description': 'Every remote specialist goes through our multi-stage qualification process.',
    'about.values.speed.title': 'Fast Placement',
    'about.values.speed.description': 'From request to integration in just 2-4 weeks.',
    'about.values.success.title': 'Measurable Success',
    'about.values.success.description': '98% customer satisfaction and over 90% project continuation rate.',
    'about.founders.title': 'About us - Joachim & Pascal',
    'about.founder.joachim.name': 'Joachim Kalff',
    'about.founder.joachim.role': 'Founder & CEO',
    'about.founder.pascal.name': 'Pascal Spieß',
    'about.founder.pascal.role': 'Consultant',
    'about.timeline.title': 'Our development since 2020',
    'about.international.title': 'Why international specialists?',
    'about.international.subtitle': 'The German skilled worker shortage requires new solutions. Our international remote experts offer not only cost-effective alternatives, but also fresh perspectives and expertise from global markets.',
    'about.international.savings.title': 'Cost Savings',
    'about.international.savings.description': 'Average savings compared to local full-time employees',
    'about.international.countries.title': 'Countries',
    'about.international.countries.description': 'International expertise from different time zones',
    'about.international.availability.title': 'Availability',
    'about.international.availability.description': 'Continuous productivity through global time zone coverage',
    'about.cta.title': 'Ready for international reinforcement?',
    'about.cta.subtitle': 'Discover how our international remote specialists can advance your business.',
    'about.cta.button': 'Start free RaaS request',
    
    // Common CTAs
    'cta.free': 'FREE',
    'common.startNow': 'Get Started',
    'common.learnMore': 'Learn More'
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