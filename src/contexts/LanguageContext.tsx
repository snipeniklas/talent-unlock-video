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
    'hero.subtitle': 'Die Remote-Experten, die Ihre HR-Herausforderungen verstehen und lösen',
    'hero.description': 'Als führender Dienstleister für internationale Fachkräfte stellen wir Ihnen seit 9 Jahren die besten Talente zur Verfügung. Unser bewährtes RaaS-System macht es einfach: Statt klassischer Anstellungen stellen wir Remote-Ressourcen über Dienstleistungsverträge bereit und schaffen so sofortigen Zugang zu qualifizierten Spezialisten weltweit.',
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
    'about.mission.description1': 'Wir machen internationale Expertise für deutsche Unternehmen zugänglich. Mit unserem Resources as a Service (RaaS) Modell revolutionieren wir die Art, wie Unternehmen auf Fachkräfte zugreifen – flexibel, effizient und ohne Grenzen.',
    'about.mission.description2': 'Statt klassischer Anstellungen stellen wir Remote-Ressourcen über Dienstleistungsverträge bereit und schaffen so sofortigen Zugang zu qualifizierten Spezialisten weltweit.',
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
    
    // HomePage - Service Features
    'services.backoffice.features.organization': 'Office Organization & Administration',
    'services.backoffice.features.accounting': 'Accounting & Controlling',
    'services.backoffice.features.support': 'Customer Service & Support',
    'services.it.features.fullstack': 'Full-Stack Development',
    'services.it.features.devops': 'DevOps & Cloud',
    'services.it.features.mobile': 'Mobile & Web Apps',
    'services.aiml.features.ml': 'Machine Learning',
    'services.aiml.features.datascience': 'Data Science',
    'services.aiml.features.strategy': 'AI Strategy Consulting',

    // HomePage - Testimonials
    'testimonials.niklas.name': 'Niklas Clasen',
    'testimonials.niklas.company': 'SNIPE Solutions',
    'testimonials.niklas.text': 'Hej Talent hat uns innerhalb von 2 Wochen die perfekte Remote-Buchhalterin vermittelt. Professionell und zuverlässig.',
    'testimonials.marc.name': 'Marc Palma',
    'testimonials.marc.company': 'ECO Containertrans',
    'testimonials.marc.text': 'Die hervorragende Arbeit von einem neuen Kollegen hat uns überzeugt, eine zweite HejTalent-Kraft ins Team zu holen.',

    // HomePage - Interactive Section
    'interactive.title': 'Erleben Sie die RaaS Hub Plattform interaktiv',
    'interactive.subtitle': 'Entdecken Sie, wie einfach es ist, internationale Remote-Fachkräfte zu finden und zu verwalten',
    'interactive.feature1.title': 'Erstelle eine Suchanfrage',
    'interactive.feature1.description': 'Beschreibe deine Anforderungen in nur wenigen Minuten',
    'interactive.feature2.title': 'Durchsuche Profile',
    'interactive.feature2.description': 'Entdecke passende Remote-Talente aus unserem Pool',
    'interactive.feature3.title': 'Verwalte dein Team',
    'interactive.feature3.description': 'Organisiere und überwache deine Remote-Mitarbeiter',

    // HomePage - Timeline Section
    'timeline.title': 'Von der Anfrage bis zur Integration',
    'timeline.subtitle': 'So einfach ist unser bewährter Onboarding-Prozess',

    // HomePage - Method Section
    'method.title': 'Unsere bewährte Arbeitsweise',
    'method.subtitle': 'Von der Anfrage bis zur erfolgreichen Integration - so funktioniert es',
    'method.step1.title': 'Kostenlose Anfrage',
    'method.step1.description': 'Beschreiben Sie Ihre Anforderungen in unserem unverbindlichen Formular',
    'method.step2.title': 'Matching & Vorauswahl',
    'method.step2.description': 'Wir finden die passenden Kandidaten aus unserem geprüften Talent Pool',
    'method.step3.title': 'Interview & Auswahl',
    'method.step3.description': 'Sie führen Gespräche und treffen die finale Entscheidung',
    'method.step4.title': 'Onboarding & Start',
    'method.step4.description': 'Wir kümmern uns um die Integration und den reibungslosen Start',
    'method.cta.title': 'Bereit für den ersten Schritt?',
    'method.cta.subtitle': 'Starten Sie Ihre kostenlose RaaS Anfrage und entdecken Sie die Möglichkeiten internationaler Remote-Expertise.',
    'method.cta.button': 'Kostenlose Anfrage starten',

    // HomePage - Testimonials Section
    'testimonials.title': 'Was unsere Kunden sagen',
    'testimonials.subtitle': 'Erfahrungen von Unternehmen, die bereits mit unseren Remote-Fachkräften arbeiten',

    // HomePage - Solutions Section
    'solutions.title': 'Unsere internationalen Fachkräfte',
    'solutions.subtitle': 'Maßgeschneiderte Remote-Teams für Ihre spezifischen Anforderungen',

    // HomePage - Platform Experience Section  
    'platform.title': 'Erleben Sie unseren',
    'platform.titleHighlight': 'RaaS',
    'platform.titleEnd': 'Hub',
    'platform.subtitle': 'Entdecken Sie, wie unser intuitiver Hub Ihren gesamten RaaS-Prozess vereinfacht - von der Anfrage bis zur erfolgreichen Zusammenarbeit.',
    'platform.request.title': 'RaaS Anfrage erstellen',
    'platform.request.description': 'Definieren Sie Ihre Anforderungen in nur wenigen Klicks. Unser intelligentes System erfasst automatisch alle relevanten Details für Ihre RaaS-Lösung.',
    'platform.matching.title': 'Ressourcen-Matching',
    'platform.matching.description': 'KI-gestütztes Matching verbindet Sie mit den passenden Remote-Experten aus unserem vorqualifizierten Pool von über 500+ Fachkräften.',
    'platform.management.title': 'Projekt-Management',
    'platform.management.description': 'Verfolgen Sie Ihre RaaS-Projekte in Echtzeit. Von der Auswahl bis zur erfolgreichen Umsetzung behalten Sie jederzeit den Überblick.',
    'platform.demo.title': 'Erleben Sie RaaS in Aktion',
    'platform.demo.description': 'Sehen Sie, wie unser intelligentes System Ihre Ressourcen-Anfragen in Echtzeit bearbeitet und die perfekten Remote-Experten für Sie findet.',
    'platform.timeline.title': 'Ihr Weg zu den perfekten',
    'platform.timeline.highlight': 'Remote-Experten',
    'platform.timeline.subtitle': 'Unser bewährter 3-Wochen-Prozess bringt Sie sicher und strukturiert zu Ihrer idealen Remote-Fachkraft.',
    'platform.cta.title': 'Bereit, Ihre Remote-Fachkräfte zu finden?',
    'platform.cta.subtitle': 'Starten Sie noch heute und erleben Sie, wie schnell und effizient Sie die besten Remote-Talente für Ihr Unternehmen finden können.',
    'platform.cta.button': 'Kostenlos testen',
    'platform.cta.buttonSecondary': 'Zum RaaS Hub',

    // HomePage - About Section
    'about.section.title': 'Über Hej Talent',
    'about.section.description': 'Seit 2020 sind wir der vertrauensvolle Partner für Unternehmen, die auf der Suche nach erstklassigen Remote-Fachkräften sind. Unser Fokus liegt auf der gründlichen Prüfung und Vermittlung von internationalen Remote-Talenten.',
    'about.section.feature1': 'Umfassende Background-Checks',
    'about.section.feature2': 'Persönliche Betreuung',
    'about.section.feature3': 'Qualitätsgarantie',

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
    'hero.subtitle': 'The remote experts who understand and solve your HR challenges',
    'hero.description': 'As a leading provider of international specialists, we have been providing you with the best talent for 9 years. Our proven RaaS system makes it simple: Instead of traditional employment, we provide remote resources through service contracts and thus create immediate access to qualified specialists worldwide.',
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
    'about.mission.description1': 'We make international expertise accessible for German companies. With our Resources as a Service (RaaS) model, we revolutionize how companies access specialists – flexible, efficient and without borders.',
    'about.mission.description2': 'Instead of traditional employment, we provide remote resources through service contracts and thus create immediate access to qualified specialists worldwide.',
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
    
    // HomePage - Service Features
    'services.backoffice.features.organization': 'Office Organization & Administration',
    'services.backoffice.features.accounting': 'Accounting & Controlling',
    'services.backoffice.features.support': 'Customer Service & Support',
    'services.it.features.fullstack': 'Full-Stack Development',
    'services.it.features.devops': 'DevOps & Cloud',
    'services.it.features.mobile': 'Mobile & Web Apps',
    'services.aiml.features.ml': 'Machine Learning',
    'services.aiml.features.datascience': 'Data Science',
    'services.aiml.features.strategy': 'AI Strategy Consulting',

    // HomePage - Testimonials
    'testimonials.niklas.name': 'Niklas Clasen',
    'testimonials.niklas.company': 'SNIPE Solutions',
    'testimonials.niklas.text': 'Hej Talent provided us with the perfect remote accountant within 2 weeks. Professional and reliable.',
    'testimonials.marc.name': 'Marc Palma',
    'testimonials.marc.company': 'ECO Containertrans',
    'testimonials.marc.text': 'The excellent work of a new colleague convinced us to bring a second HejTalent specialist into the team.',

    // HomePage - Interactive Section
    'interactive.title': 'Experience the RaaS Hub Platform Interactively',
    'interactive.subtitle': 'Discover how easy it is to find and manage international remote specialists',
    'interactive.feature1.title': 'Create a Search Request',
    'interactive.feature1.description': 'Describe your requirements in just a few minutes',
    'interactive.feature2.title': 'Browse Profiles',
    'interactive.feature2.description': 'Discover suitable remote talents from our pool',
    'interactive.feature3.title': 'Manage Your Team',
    'interactive.feature3.description': 'Organize and monitor your remote employees',

    // HomePage - Timeline Section
    'timeline.title': 'From Request to Integration',
    'timeline.subtitle': 'This is how our proven onboarding process works',

    // HomePage - Method Section
    'method.title': 'Our Proven Working Method',
    'method.subtitle': 'From request to successful integration - this is how it works',
    'method.step1.title': 'Free Request',
    'method.step1.description': 'Describe your requirements in our non-binding form',
    'method.step2.title': 'Matching & Pre-selection',
    'method.step2.description': 'We find the right candidates from our verified talent pool',
    'method.step3.title': 'Interview & Selection',
    'method.step3.description': 'You conduct interviews and make the final decision',
    'method.step4.title': 'Onboarding & Start',
    'method.step4.description': 'We take care of integration and smooth start',
    'method.cta.title': 'Ready for the first step?',
    'method.cta.subtitle': 'Start your free RaaS request and discover the possibilities of international remote expertise.',
    'method.cta.button': 'Start Free Request',

    // HomePage - Testimonials Section
    'testimonials.title': 'What Our Customers Say',
    'testimonials.subtitle': 'Experiences from companies already working with our remote specialists',

    // HomePage - Solutions Section
    'solutions.title': 'Our International Specialists',
    'solutions.subtitle': 'Tailored remote teams for your specific requirements',

    // HomePage - Platform Experience Section  
    'platform.title': 'Experience our',
    'platform.titleHighlight': 'RaaS',
    'platform.titleEnd': 'Hub',
    'platform.subtitle': 'Discover how our intuitive hub simplifies your entire RaaS process - from request to successful collaboration.',
    'platform.request.title': 'Create RaaS Request',
    'platform.request.description': 'Define your requirements in just a few clicks. Our intelligent system automatically captures all relevant details for your RaaS solution.',
    'platform.matching.title': 'Resource Matching',
    'platform.matching.description': 'AI-powered matching connects you with the right remote experts from our pre-qualified pool of 500+ specialists.',
    'platform.management.title': 'Project Management',
    'platform.management.description': 'Track your RaaS projects in real-time. From selection to successful implementation, you always stay in control.',
    'platform.demo.title': 'Experience RaaS in Action',
    'platform.demo.description': 'See how our intelligent system processes your resource requests in real-time and finds the perfect remote experts for you.',
    'platform.timeline.title': 'Your path to the perfect',
    'platform.timeline.highlight': 'Remote Experts',
    'platform.timeline.subtitle': 'Our proven 3-week process guides you safely and structured to your ideal remote specialist.',
    'platform.cta.title': 'Ready to find your remote specialists?',
    'platform.cta.subtitle': 'Start today and experience how quickly and efficiently you can find the best remote talents for your company.',
    'platform.cta.button': 'Try for Free',
    'platform.cta.buttonSecondary': 'To RaaS Hub',

    // HomePage - About Section
    'about.section.title': 'About Hej Talent',
    'about.section.description': 'Since 2020, we have been the trusted partner for companies looking for first-class remote specialists. Our focus is on thorough screening and placement of international remote talents.',
    'about.section.feature1': 'Comprehensive Background Checks',
    'about.section.feature2': 'Personal Support',
    'about.section.feature3': 'Quality Guarantee',

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