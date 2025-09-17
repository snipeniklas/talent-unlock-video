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
    
    // Benefits
    'benefits.cheaper': '30% günstiger',
    'benefits.onboarding': 'Onboarding in 2-4 Wochen',
    'benefits.verified': 'Geprüfte Remote-Fachkräfte',
    'benefits.noHeadhunterFee': 'Keine Headhunter-Fee',
    'benefits.gdprCompliant': 'Remote & DSGVO-konform',
    'benefits.scalable': 'Skalierung jederzeit möglich',
    'benefits.noRecruiting': 'Kein Recruiting-Aufwand',
    'benefits.timezoneCompatible': 'Zeitzonen-kompatibel',
    'benefits.available247': 'Dienstleistungen 24/7 an 365 Tagen möglich',

    // HomePage - Hero Section
    'hero.title': 'Remote-Fachkräfte für',
    'hero.titleHighlight': 'jede Anforderung',
    'hero.subtitle': 'Remote Recruiting as a Service',
    'hero.description': 'Wir verbinden Ihr Unternehmen mit den besten Remote-Talenten weltweit. Von Backoffice über IT-Development bis hin zu AI & ML - finden Sie die perfekte Lösung für Ihre Bedürfnisse.',
    'hero.getStarted': 'Jetzt starten',
    'hero.learn': 'Mehr erfahren',
    'hero.riskFree': 'Risikofrei',
    'hero.riskFreeDesc': 'Keine Kosten bei erfolgloser Vermittlung',
    'hero.trustBadge': 'Vertraut von 150+ Unternehmen',
    'hero.watchDemo': 'Demo ansehen',
    
    // Hero badges
    'hero.badge.expertise': '5+ Jahre Expertise',
    'hero.badge.specialists': '500+ Fachkräfte',
    'hero.badge.success': '98% Erfolgsrate',
    'hero.badge.guarantee': '100% Garantie',
    
    // Hero CTAs
    'hero.cta.main': 'Kostenlose RaaS-Anfrage stellen',
    'hero.cta.secondary': 'Erfahren Sie mehr über RaaS',
    
    // Hero video
    'hero.video.title': 'Sehen Sie RaaS in Aktion',
    
    // Hero risk-free section
    'hero.riskFree.title': 'Risikofrei',
    'hero.riskFree.description': 'Keine Kosten bei erfolgloser Vermittlung',
    
    // Hero trust indicators
    'hero.trust.text': 'Vertraut von 150+ Unternehmen weltweit',
    'hero.trust.international': 'International',
    'hero.trust.gdpr': 'DSGVO-konform',
    'hero.trust.iso': 'ISO-zertifiziert',

    // HomePage - Solutions Preview
    'solutions.title': 'Unsere RaaS Lösungen',
    'solutions.subtitle': 'Drei spezialisierte Services für jeden Bedarf',
    'solutions.backoffice.title': 'Remote Backoffice',
    'solutions.backoffice.description': 'Qualifizierte Remote-Mitarbeiter für Verwaltung, Buchhaltung und operative Unterstützung',
    'solutions.backoffice.features': 'Administrative Tasks, Buchhaltung, Kundenservice, Datenmanagement',
    'solutions.it.title': 'Remote IT Development',
    'solutions.it.description': 'Erfahrene Remote-Entwickler für Full-Stack, DevOps und Software-Architektur',
    'solutions.it.features': 'Full-Stack Development, Mobile Apps, DevOps, Cloud-Architektur',
    'solutions.aiml.title': 'Remote AI & ML',
    'solutions.aiml.description': 'KI-Experten und Data Scientists für Machine Learning und AI-Projekte',
    'solutions.aiml.features': 'Machine Learning, Data Science, AI-Modelle, Algorithmus-Entwicklung',
    'solutions.learnMore': 'Mehr erfahren',

    // HomePage - Services
    'services.backoffice.title': 'Remote Backoffice Specialists',
    'services.backoffice.description': 'Qualifizierte Remote-Mitarbeiter für Verwaltung, Buchhaltung und operative Unterstützung',
    'services.backoffice.features.organization': 'Administrative Aufgaben',
    'services.backoffice.features.accounting': 'Buchhaltung',
    'services.backoffice.features.support': 'Kundenservice',
    'services.it.title': 'Remote IT Developers & Tech Experts',
    'services.it.description': 'Erfahrene Remote-Entwickler für Full-Stack, DevOps und Software-Architektur',
    'services.it.features.fullstack': 'Full-Stack Development',
    'services.it.features.devops': 'DevOps & Cloud',
    'services.it.features.mobile': 'Mobile Apps',
    'services.aiml.title': 'Remote AI & ML Specialists',
    'services.aiml.description': 'KI-Experten und Data Scientists für Machine Learning und AI-Projekte',
    'services.aiml.features.ml': 'Machine Learning',
    'services.aiml.features.datascience': 'Data Science',
    'services.aiml.features.strategy': 'KI-Strategieberatung',
    'services.cta.button': 'Jetzt starten',
    
    // HomePage - Stats
    'stats.title': 'Marktführer für Remote-Recruiting seit 2020',
    'stats.subtitle': 'Zahlen, die unsere Expertise belegen',
    'stats.award': '🏆 Ausgezeichnet als "Beste Remote-Recruiting-Plattform 2023"',
    'stats.awardDescription': 'Über 150 Unternehmen vertrauen bereits auf unsere bewährte RaaS-Methodik. Vom Startup bis zum DAX-Konzern - wir finden die richtigen Remote-Experten.',
    'stats.specialists': 'Vermittelte Remote-Fachkräfte',
    'stats.placements': 'Erfolgreiche Vermittlungen',
    'stats.satisfaction': 'Zufriedene Unternehmen',
    'stats.time': 'Wochen Vermittlungszeit',
    'stats.cta.title': 'Ihre kostenlose RaaS-Anfrage dauert nur 3 Minuten',
    'stats.cta.description': 'Beschreiben Sie Ihre Herausforderung, wir schlagen passende Experten vor. Kein Risiko, keine versteckten Kosten.',
    'stats.cta.button': 'Jetzt kostenlos starten',

    // HomePage - Method Section
    'method.title': 'Wie wir arbeiten',
    'method.subtitle': 'Unser bewährter Prozess',
    'method.feature1': 'Persönliche Beratung',
    'method.feature2': 'Maßgeschneiderte Lösungen',
    'method.feature3': 'Kontinuierliche Betreuung',
    'method.feature4': 'Qualitätsgarantie',

    // HomePage - Testimonials
    'testimonials.title': 'Was unsere Kunden sagen',
    'testimonials.subtitle': 'Echte Erfahrungen von zufriedenen Unternehmen',
    'testimonials.customer1.text': 'Hej Talent hat uns dabei geholfen, erstklassige Remote-Entwickler zu finden. Der Prozess war effizient und die Qualität der Kandidaten übertraf unsere Erwartungen.',
    'testimonials.customer1.name': 'Sarah Weber',
    'testimonials.customer1.company': 'TechStart GmbH',
    'testimonials.customer2.text': 'Dank der Remote-Backoffice-Lösung konnten wir unsere Kosten um 40% senken und gleichzeitig die Effizienz steigern. Absolute Empfehlung!',
    'testimonials.customer2.name': 'Michael Braun',
    'testimonials.customer2.company': 'InnovateCorp',
    'testimonials.customer3.text': 'Die AI-Experten, die wir über Hej Talent gefunden haben, haben unser Machine Learning-Projekt zum Erfolg geführt. Professionell und kompetent.',
    'testimonials.customer3.name': 'Dr. Lisa Müller',
    'testimonials.customer3.company': 'DataTech Solutions',
    
    // Testimonials with correct naming for HomePage
    'testimonials.niklas.text': 'Hej Talent hat uns dabei geholfen, erstklassige Remote-Entwickler zu finden. Der Prozess war effizient und die Qualität der Kandidaten übertraf unsere Erwartungen.',
    'testimonials.niklas.name': 'Niklas Weber',
    'testimonials.niklas.company': 'TechStart GmbH',
    'testimonials.marc.text': 'Dank der Remote-Backoffice-Lösung konnten wir unsere Kosten um 40% senken und gleichzeitig die Effizienz steigern. Absolute Empfehlung!',
    'testimonials.marc.name': 'Marc Braun',
    'testimonials.marc.company': 'InnovateCorp',

    // HomePage - Platform Experience Section
    'platform.title': 'Erleben Sie unseren',
    'platform.titleHighlight': 'RaaS',
    'platform.titleEnd': 'Hub',
    'platform.subtitle': 'Entdecken Sie, wie unser intuitiver Hub Ihren gesamten RaaS-Prozess vereinfacht - von der Anfrage bis zur erfolgreichen Zusammenarbeit.',
    'platform.request.title': 'RaaS-Anfrage erstellen',
    'platform.request.description': 'Definieren Sie Ihre Anforderungen in nur wenigen Klicks. Unser intelligentes System erfasst automatisch alle relevanten Details für Ihre RaaS-Lösung.',
    'platform.matching.title': 'Ressourcen-Matching',
    'platform.matching.description': 'KI-gestütztes Matching verbindet Sie mit den richtigen Remote-Experten aus unserem vorqualifizierten Pool von 500+ Fachkräften.',
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
    'platform.features.request.skillSelection': 'Skill-basierte Auswahl',
    'platform.features.request.budgetTime': 'Budget & Zeitrahmen',
    'platform.features.request.specification': 'Projektspezifikation',
    'platform.features.matching.automatic': 'Automatisches Matching',
    'platform.features.matching.reviews': 'Profil-Bewertungen',
    'platform.features.matching.availability': 'Verfügbarkeits-Check',
    'platform.features.management.dashboard': 'Live-Dashboard',
    'platform.features.management.tracking': 'Fortschritt-Tracking',
    'platform.features.management.communication': 'Kommunikations-Hub',
    
    // Timeline translations
    'timeline.title': 'Zeitplan',
    'timeline.process': '3 Wochen Prozess',
    'timeline.weeks.optional': 'Opt. Woche 1',
    'timeline.weeks.week1': 'Woche 1',
    'timeline.weeks.week2': 'Woche 2',
    'timeline.weeks.week3': 'Woche 3',
    'timeline.activities.consultation.title': 'Beratung',
    'timeline.activities.consultation.description': 'Analyse Ihrer Anforderungen und Zielsetzung',
    'timeline.activities.requirements.title': 'Aufnahme Anforderungen',
    'timeline.activities.requirements.description': 'Detaillierte Spezifikation der benötigten Expertise',
    'timeline.activities.candidates.title': 'Kandidatenvorschlag',
    'timeline.activities.candidates.description': 'Präsentation passender Remote-Experten',
    'timeline.activities.selection.title': 'Auswahlprozess',
    'timeline.activities.selection.description': 'Interviews und finale Kandidatenauswahl',
    'timeline.activities.implementation.title': 'Umsetzungsbetreuung',
    'timeline.activities.implementation.description': 'Onboarding und kontinuierliche Unterstützung',
    'timeline.duration.day1': 'max. 1 Tag',
    'timeline.duration.days3': 'max. 3 Tage',
    'timeline.duration.days6': 'max. 6 Tage',
    'timeline.duration.days7': 'max. 7 Tage',
    'timeline.duration.days10': 'max. 10 Tage',
    'timeline.duration.days': 'max. {count} Tage',
    'timeline.milestones.kickoff': 'Kickoff',
    'timeline.milestones.firstDay': '1. Arbeitstag',
    'timeline.cta': 'Projekt jetzt starten',
    'timeline.optional': '(optional)',
    
    // Contact translations
    'contact.title': 'Kontakt aufnehmen',
    'contact.subtitle': 'Lassen Sie uns gemeinsam die passenden Remote-Fachkräfte für Ihr Unternehmen finden',
    'contact.speak': 'Sprechen Sie uns an',
    'contact.labels.email': 'E-Mail',
    'contact.labels.phone': 'Telefon',
    'contact.labels.linkedin': 'LinkedIn Profil',
    'contact.labels.location': 'Standort',
    'contact.location': 'München, Deutschland',
    'contact.form.title': 'Suchauftrag kostenlos erstellen',
    'contact.form.subtitle': 'Erzählen Sie uns von Ihrem Projekt und wir melden uns binnen 24 Stunden',
    'contact.form.placeholders.firstName': 'Vorname',
    'contact.form.placeholders.lastName': 'Nachname',
    'contact.form.placeholders.email': 'E-Mail-Adresse',
    'contact.form.placeholders.company': 'Unternehmen',
    'contact.form.placeholders.phone': 'Telefon',
    'contact.form.placeholders.description': 'Beschreiben Sie Ihren Remote-Fachkräfte-Bedarf...',
    'contact.form.cta': 'Jetzt kostenfrei Suchauftrag einstellen',

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
    
    // Benefits
    'benefits.cheaper': '30% cheaper',
    'benefits.onboarding': 'Onboarding in 2-4 weeks',
    'benefits.verified': 'Verified remote specialists',
    'benefits.noHeadhunterFee': 'No headhunter fee',
    'benefits.gdprCompliant': 'Remote & GDPR compliant',
    'benefits.scalable': 'Scaling possible anytime',
    'benefits.noRecruiting': 'No recruiting effort',
    'benefits.timezoneCompatible': 'Timezone compatible',
    'benefits.available247': 'Services 24/7, 365 days available',

    // HomePage - Hero Section
    'hero.title': 'Remote Specialists for',
    'hero.titleHighlight': 'Every Requirement',
    'hero.subtitle': 'Remote Recruiting as a Service',
    'hero.description': 'We connect your company with the best remote talents worldwide. From backoffice to IT development to AI & ML - find the perfect solution for your needs.',
    'hero.getStarted': 'Get Started',
    'hero.learn': 'Learn More',
    'hero.riskFree': 'Risk-free',
    'hero.riskFreeDesc': 'No costs for unsuccessful placements',
    'hero.trustBadge': 'Trusted by 150+ companies',
    'hero.watchDemo': 'Watch Demo',
    
    // Hero badges
    'hero.badge.expertise': '5+ Years Expertise',
    'hero.badge.specialists': '500+ Specialists',
    'hero.badge.success': '98% Success Rate',
    'hero.badge.guarantee': '100% Guarantee',
    
    // Hero CTAs
    'hero.cta.main': 'Create Free RaaS Request',
    'hero.cta.secondary': 'Learn more about RaaS',
    
    // Hero video
    'hero.video.title': 'See RaaS in Action',
    
    // Hero risk-free section
    'hero.riskFree.title': 'Risk-free',
    'hero.riskFree.description': 'No costs for unsuccessful placements',
    
    // Hero trust indicators
    'hero.trust.text': 'Trusted by 150+ companies worldwide',
    'hero.trust.international': 'International',
    'hero.trust.gdpr': 'GDPR compliant',
    'hero.trust.iso': 'ISO certified',

    // HomePage - Solutions Preview
    'solutions.title': 'Our RaaS Solutions',
    'solutions.subtitle': 'Three specialized services for every need',
    'solutions.backoffice.title': 'Remote Backoffice',
    'solutions.backoffice.description': 'Qualified remote employees for administration, accounting and operational support',
    'solutions.backoffice.features': 'Administrative Tasks, Accounting, Customer Service, Data Management',
    'solutions.it.title': 'Remote IT Development',
    'solutions.it.description': 'Experienced remote developers for full-stack, DevOps and software architecture',
    'solutions.it.features': 'Full-Stack Development, Mobile Apps, DevOps, Cloud Architecture',
    'solutions.aiml.title': 'Remote AI & ML',
    'solutions.aiml.description': 'AI experts and data scientists for machine learning and AI projects',
    'solutions.aiml.features': 'Machine Learning, Data Science, AI Models, Algorithm Development',
    'solutions.learnMore': 'Learn More',

    // HomePage - Services
    'services.backoffice.title': 'Remote Backoffice Specialists',
    'services.backoffice.description': 'Qualified remote employees for administration, accounting and operational support',
    'services.backoffice.features.organization': 'Administrative Tasks',
    'services.backoffice.features.accounting': 'Accounting',
    'services.backoffice.features.support': 'Customer Service',
    'services.it.title': 'Remote IT Developers & Tech Experts',
    'services.it.description': 'Experienced remote developers for full-stack, DevOps and software architecture',
    'services.it.features.fullstack': 'Full-Stack Development',
    'services.it.features.devops': 'DevOps & Cloud',
    'services.it.features.mobile': 'Mobile Apps',
    'services.aiml.title': 'Remote AI & ML Specialists',
    'services.aiml.description': 'AI experts and data scientists for machine learning and AI projects',
    'services.aiml.features.ml': 'Machine Learning',
    'services.aiml.features.datascience': 'Data Science',
    'services.aiml.features.strategy': 'AI Strategy Consulting',
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

    // HomePage - Method Section
    'method.title': 'How We Work',
    'method.subtitle': 'Our proven process',
    'method.feature1': 'Personal consultation',
    'method.feature2': 'Tailored solutions',
    'method.feature3': 'Continuous support',
    'method.feature4': 'Quality guarantee',

    // HomePage - Testimonials
    'testimonials.title': 'What our customers say',
    'testimonials.subtitle': 'Real experiences from satisfied companies',
    'testimonials.customer1.text': 'Hej Talent helped us find top-notch remote developers. The process was efficient and the quality of candidates exceeded our expectations.',
    'testimonials.customer1.name': 'Sarah Weber',
    'testimonials.customer1.company': 'TechStart GmbH',
    'testimonials.customer2.text': 'Thanks to the remote backoffice solution, we were able to reduce our costs by 40% while increasing efficiency. Absolute recommendation!',
    'testimonials.customer2.name': 'Michael Braun',
    'testimonials.customer2.company': 'InnovateCorp',
    'testimonials.customer3.text': 'The AI experts we found through Hej Talent led our machine learning project to success. Professional and competent.',
    'testimonials.customer3.name': 'Dr. Lisa Müller',
    'testimonials.customer3.company': 'DataTech Solutions',
    
    // Testimonials with correct naming for HomePage
    'testimonials.niklas.text': 'Hej Talent helped us find top-notch remote developers. The process was efficient and the quality of candidates exceeded our expectations.',
    'testimonials.niklas.name': 'Niklas Weber',
    'testimonials.niklas.company': 'TechStart GmbH',
    'testimonials.marc.text': 'Thanks to the remote backoffice solution, we were able to reduce our costs by 40% while increasing efficiency. Absolute recommendation!',
    'testimonials.marc.name': 'Marc Braun',
    'testimonials.marc.company': 'InnovateCorp',

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
    'platform.features.request.skillSelection': 'Skill-based selection',
    'platform.features.request.budgetTime': 'Budget & timeframe',
    'platform.features.request.specification': 'Project specification',
    'platform.features.matching.automatic': 'Automatic matching',
    'platform.features.matching.reviews': 'Profile reviews',
    'platform.features.matching.availability': 'Availability check',
    'platform.features.management.dashboard': 'Live dashboard',
    'platform.features.management.tracking': 'Progress tracking',
    'platform.features.management.communication': 'Communication hub',
    
    // Timeline translations
    'timeline.title': 'Timeline',
    'timeline.process': '3 week process',
    'timeline.weeks.optional': 'Opt. Week 1',
    'timeline.weeks.week1': 'Week 1',
    'timeline.weeks.week2': 'Week 2',
    'timeline.weeks.week3': 'Week 3',
    'timeline.activities.consultation.title': 'Consultation',
    'timeline.activities.consultation.description': 'Analysis of your requirements and objectives',
    'timeline.activities.requirements.title': 'Requirements gathering',
    'timeline.activities.requirements.description': 'Detailed specification of needed expertise',
    'timeline.activities.candidates.title': 'Candidate proposal',
    'timeline.activities.candidates.description': 'Presentation of suitable remote experts',
    'timeline.activities.selection.title': 'Selection process',
    'timeline.activities.selection.description': 'Interviews and final candidate selection',
    'timeline.activities.implementation.title': 'Implementation support',
    'timeline.activities.implementation.description': 'Onboarding and continuous support',
    'timeline.duration.day1': 'max. 1 day',
    'timeline.duration.days3': 'max. 3 days',
    'timeline.duration.days6': 'max. 6 days',
    'timeline.duration.days7': 'max. 7 days',
    'timeline.duration.days10': 'max. 10 days',
    'timeline.duration.days': 'max. {count} days',
    'timeline.milestones.kickoff': 'Kickoff',
    'timeline.milestones.firstDay': '1st working day',
    'timeline.cta': 'Start project now',
    'timeline.optional': '(optional)',
    
    // Contact translations
    'contact.title': 'Get in touch',
    'contact.subtitle': 'Let us help you find the right remote specialists for your business together',
    'contact.speak': 'Contact us',
    'contact.labels.email': 'Email',
    'contact.labels.phone': 'Phone',
    'contact.labels.linkedin': 'LinkedIn Profile',
    'contact.labels.location': 'Location',
    'contact.location': 'Munich, Germany',
    'contact.form.title': 'Create search request for free',
    'contact.form.subtitle': 'Tell us about your project and we\'ll get back to you within 24 hours',
    'contact.form.placeholders.firstName': 'First name',
    'contact.form.placeholders.lastName': 'Last name',
    'contact.form.placeholders.email': 'Email address',
    'contact.form.placeholders.company': 'Company',
    'contact.form.placeholders.phone': 'Phone',
    'contact.form.placeholders.description': 'Describe your remote specialist needs...',
    'contact.form.cta': 'Submit free search request now',

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
  const [language, setLanguage] = useState<Language>('de');
  const location = useLocation();

  useEffect(() => {
    const pathLanguage = location.pathname.startsWith('/en') ? 'en' : 'de';
    setLanguage(pathLanguage);
  }, [location]);

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