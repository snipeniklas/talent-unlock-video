import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MiniTeamSection } from '@/components/MiniTeamSection';

import { Play, Star, CheckCircle, Users, Clock, Shield, Calendar, Linkedin } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import customerLogos from '@/assets/customer-logos.png';
import verifiedBadge from '@/assets/verified-badge.png';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';
import { useTranslation } from '@/i18n/i18n';

const HejTalentLanding = () => {
  const { t, get } = useTranslation();
  
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) {
            setVisibleCards(prev => {
              const newState = [...prev];
              newState[index] = entry.isIntersecting;
              return newState;
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);


  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Sticky Trust Bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-3">
            {/* Just Logo */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center animate-slide-in-left">
                <img src={hejTalentLogo} alt="Hej Talent" className="h-8 md:h-10 hover:scale-105 transition-transform duration-300" />
              </div>
            </div>
        </div>
      </div>

      {/* Benefit Ticker */}
      <div className="bg-neutral-50 h-12 flex items-center overflow-hidden border-b">
        <div className="animate-slide-text hover:animate-none flex items-center gap-12 whitespace-nowrap min-w-max">
          {get<string[]>('landing.hejTalent.ticker', [
            '30-60% günstiger',
            'Start in 7 Tagen',
            'Geprüfte KI-Entwickler',
            'Geld-zurück-Garantie',
            'Keine Headhunter-Fee',
            'Remote & DSGVO-konform',
            'Skalierung jederzeit möglich',
            'Kein Recruiting-Aufwand',
            'Zeitzonen-kompatibel',
            'Onboarding in < 1 Tag'
          ]).map((text, idx) => (
            <span key={`ticker-a-${idx}`} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
              {text} <span className="text-primary text-lg">•</span>
            </span>
          ))}
          {get<string[]>('landing.hejTalent.ticker', []).map((text, idx) => (
            <span key={`ticker-b-${idx}`} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
              {text} <span className="text-primary text-lg">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight animate-fade-in">
              <span className="text-primary">RaaS</span> {t('landing.hejTalent.hero.title', '- Geprüfte KI-Entwickler')} {' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary-hover bg-clip-text animate-shimmer bg-shimmer bg-200% animate-bounce-in-delay-1">
                {t('landing.hejTalent.hero.badge', '30-60% günstiger')}
              </span> {t('landing.hejTalent.hero.trailing', 'in 7 Tagen')}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto animate-fade-in-delay-1">
              <strong>Resources as a Service</strong> – {t('landing.hejTalent.hero.p1', 'Unser bewährtes RaaS-System macht es einfach: Sie beschreiben Ihr KI-Projekt, wir liefern die perfekte Entwickler-Lösung.')}
            </p>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-delay-1">
              {t('landing.hejTalent.hero.p2', 'Exklusives Video zeigt Ihnen den bewährten 3-Schritte RaaS-Prozess für hochqualifizierte Entwickler aus unserem Netzwerk – ohne Risiko und mit Geld-zurück-Garantie.')}
            </p>

            {/* Video Player */}
            <div className="relative mb-12 animate-slide-up-delay-2">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto group hover:shadow-3xl transition-all duration-700 hover:scale-[1.02]">
                <div className="aspect-video bg-black flex items-center justify-center">
                  <iframe
                    src="https://drive.google.com/file/d/1vMtWbY24d-ELZ8K76f4yF2zrngkkJLLW/preview"
                    title="Hej Talent RaaS Video"
                    className="w-full h-full"
                    allow="autoplay"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            <Button
              variant="cta"
              size="xl"
              asChild
              className="mb-16 animate-fade-in-delay-3 hover:scale-105 relative overflow-hidden"
            >
              <Link to="/app/search-requests/new">
                <span className="relative z-10">
                  {t('landing.hejTalent.hero.cta', 'RaaS Anfrage stellen')}
                </span>
                <div className="absolute inset-0 bg-shimmer animate-shimmer bg-200%"></div>
              </Link>
            </Button>

            {/* 3-Bullet Preview */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card 
                ref={(el) => {cardRefs.current[0] = el;}}
                className={`border-2 hover:border-primary transition-all duration-500 hover:shadow-xl hover:scale-105 group ${
                  visibleCards[0] 
                    ? 'animate-scale-in opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.1s' }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.hejTalent.bullets.0.title', '30-50% Kostenersparnis')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.hejTalent.bullets.0.text', 'Sparen Sie bis zu €4.000 pro Monat bei gleicher Qualität durch unser direktes Netzwerk')}
                  </p>
                </CardContent>
              </Card>

              <Card 
                ref={(el) => {cardRefs.current[1] = el;}}
                className={`border-2 hover:border-primary transition-all duration-500 hover:shadow-xl hover:scale-105 group ${
                  visibleCards[1] 
                    ? 'animate-scale-in opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.3s' }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.hejTalent.bullets.1.title', '48h Matching-Prozess')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.hejTalent.bullets.1.text', 'Von der Anfrage zum perfekten Entwickler in nur 2 Tagen – Start bereits nach 7 Tagen')}
                  </p>
                </CardContent>
              </Card>

              <Card 
                ref={(el) => {cardRefs.current[2] = el;}}
                className={`border-2 hover:border-primary transition-all duration-500 hover:shadow-xl hover:scale-105 group ${
                  visibleCards[2] 
                    ? 'animate-scale-in opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.5s' }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.hejTalent.bullets.2.title', '100% Geld-zurück-Garantie')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.hejTalent.bullets.2.text', 'Nicht zufrieden? Volle Rückerstattung in den ersten 14 Tagen – ohne Fragen')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stack */}
      <section className="py-16 bg-gradient-subtle overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 animate-fade-in">
              {t('landing.hejTalent.trust.title', 'Über 50 Unternehmen vertrauen bereits auf Hej Talent')}
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6 hover:shadow-xl transition-all duration-500 animate-slide-in-left hover:scale-105 group">
                <div className="flex items-start gap-4">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current hover:scale-110 transition-transform duration-200" style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-3 group-hover:text-foreground transition-colors duration-300">
                      {t('landing.hejTalent.testimonials.0', '"Binnen 5 Tagen hatte ich den perfekten KI-Entwickler. Spart uns monatlich €3.200 bei besserer Qualität."')}
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">Niklas Clasen, CEO SNIPE Solutions</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-500 animate-slide-in-right hover:scale-105 group">
                <div className="flex items-start gap-4">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current hover:scale-110 transition-transform duration-200" style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-3 group-hover:text-foreground transition-colors duration-300">
                      {t('landing.hejTalent.testimonials.1', '"Die hervorragende Arbeit von einem neuen Kollegen hat uns überzeugt, eine zweite HejTalent-Kraft ins Team zu holen."')}
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">Marc Palma, Geschäftsführer, ECO Containertrans</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-center gap-4 text-primary animate-bounce-in-delay-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current hover:scale-110 transition-transform duration-200" />
                ))}
              </div>
              <span className="font-semibold text-lg hover:scale-110 transition-transform duration-300">4,9 / 5</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors duration-300">{t('landing.hejTalent.reviews.caption', 'aus 57 Bewertungen')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Team Section */}
      <MiniTeamSection />

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.hejTalent.faq.title', 'Häufig gestellte Fragen')}
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="quality" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-1 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.hejTalent.faq.items.0.q', 'Wie stellen Sie die Qualität der Entwickler sicher?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.hejTalent.faq.items.0.a', 'Jeder Entwickler durchläuft einen 3-stufigen Prüfprozess: Technische Skills-Tests, Live-Coding-Session und Referenzcheck. Nur 8% aller Bewerber bestehen unsere Standards.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-2 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.hejTalent.faq.items.1.q', 'Wie wird der Datenschutz gewährleistet?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.hejTalent.faq.items.1.a', 'DSGVO-konform, deutsche Server und NDAs mit allen Entwicklern. Ihre Projektdaten bleiben zu 100% vertraulich und sicher.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="communication" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-3 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.hejTalent.faq.items.2.q', 'Wie funktioniert die Kommunikation?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.hejTalent.faq.items.2.a', 'Alle unsere Entwickler arbeiten in europäischen Zeitzonen und kommunizieren professionell über Ihre bevorzugten Tools.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contract" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-4 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.hejTalent.faq.items.3.q', 'Welche Vertragsmodelle bieten Sie an?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.hejTalent.faq.items.3.a', 'Flexibel nach Ihren Bedürfnissen: Vollzeit, Teilzeit oder projektbasiert. Monatliche Kündigung möglich, keine langfristigen Bindungen.')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-12 bg-brand-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-xl mb-4">Hej Talent</h3>
                <p className="text-gray-300 text-sm">
                  {t('landing.hejTalent.footer.tagline', 'Ihr Partner für geprüfte internationale Remote-KI-Entwickler.')}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">{t('landing.hejTalent.footer.legal', 'Rechtliches')}</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://hejtalent.de/imprint-de/" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">{t('footer.links.imprint', 'Impressum')}</a></li>
                  <li><a href="https://hejtalent.de/privacy-policy-de/" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">{t('footer.links.privacy', 'Datenschutz')}</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">{t('landing.hejTalent.footer.contact', 'Kontakt')}</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>
                    <a href="mailto:kontakt@hejtalent.de" className="hover:text-white transition-colors">
                      kontakt@hejtalent.de
                    </a>
                  </li>
                  <li>
                    <a href="tel:+4989901762180" className="hover:text-white transition-colors">
                      +49 89 9017 6218
                    </a>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Social Media</h4>
                <a href="https://www.linkedin.com/company/hejtalent/?originalSubdomain=de" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
              © 2025 Hej Talent. {t('landing.hejTalent.footer.rights', 'Alle Rechte vorbehalten.')}
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
    </div>
  );
};

export default HejTalentLanding;