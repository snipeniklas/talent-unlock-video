import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Play, Star, CheckCircle, Users, Clock, Shield, Calendar, Linkedin, Calculator, Clock3, Headphones } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import customerLogos from '@/assets/customer-logos.png';
import verifiedBadge from '@/assets/verified-badge.png';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';
import { useTranslation } from '@/i18n/i18n';

const BackofficeLanding = () => {
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
          {get<string[]>('landing.backoffice.ticker', [
            '40-60% günstiger',
            'Start in 2-4 Wochen',
            'Geprüfte Backoffice-Profis',
            'Keine Headhunter-Fee',
            'Remote & DSGVO-konform',
            'Skalierung jederzeit möglich'
          ]).map((text, idx) => (
            <span key={`ticker-a-${idx}`} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
              {text} <span className="text-primary text-lg">•</span>
            </span>
          ))}
          {get<string[]>('landing.backoffice.ticker', []).map((text, idx) => (
            <span key={`ticker-b-${idx}`} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
              {text} <span className="text-primary text-lg">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight animate-fade-in">
              <span className="text-primary">RaaS</span> {t('landing.backoffice.hero.title', '- Remote Backoffice-Fachkräfte')}{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary-hover bg-clip-text animate-shimmer bg-shimmer bg-200% animate-bounce-in-delay-1">
                {t('landing.backoffice.hero.badge', '40-60% günstiger')}
              </span> {t('landing.backoffice.hero.trailing', 'als lokale Mitarbeiter')}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto animate-fade-in-delay-1">
              <strong>Resources as a Service</strong> – {t('landing.backoffice.hero.p1', 'Unser bewährtes RaaS-System macht es einfach: Sie beschreiben Ihre Backoffice-Anforderungen, wir liefern die perfekte Fachkraft-Lösung.')}
            </p>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-delay-1">
              {t('landing.backoffice.hero.p2', 'Entdecken Sie, wie Sie hochqualifizierte Backoffice-Profis für Buchhaltung, Admin und Kundenservice aus unserem geprüften Netzwerk bekommen – remote, zuverlässig und DSGVO-konform.')}
            </p>

            {/* Video Player */}
            <div className="relative mb-12 animate-slide-up-delay-2">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto group hover:shadow-3xl transition-all duration-700 hover:scale-[1.02]">
                <div className="aspect-video bg-black flex items-center justify-center">
                  <iframe
                    src="https://drive.google.com/file/d/1CMUsjBj2wilyk-9fS0aL7ehnBe5kxMpH/preview"
                    title="Backoffice-Fachkräfte RaaS Video"
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
              className="mb-16 animate-bounce-in-delay-3 hover:animate-pulse relative overflow-hidden"
            >
              <Link to="/app/search-requests/new">
                <span className="relative z-10">
                  {t('landing.backoffice.hero.cta', 'RaaS Anfrage stellen')}
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
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.backoffice.bullets.0.title', 'Massive Kostenersparnis')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.backoffice.bullets.0.text', 'Optimieren Sie Ihre Backoffice-Prozesse durch qualifizierte Remote-Fachkräfte')}
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
                    <Clock3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.backoffice.bullets.1.title', 'Flexibel skalieren')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.backoffice.bullets.1.text', 'Von 10h/Woche bis Vollzeit – passen Sie die Kapazität jederzeit an Ihre Bedürfnisse an')}
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
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.backoffice.bullets.2.title', 'Professionelle Kommunikation')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.backoffice.bullets.2.text', 'Alle unsere Backoffice-Profis kommunizieren professionell und verstehen Ihre Arbeitsweise')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-red-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6 animate-fade-in">
              {t('landing.backoffice.problem.title', 'Kennen Sie diese Backoffice-Herausforderungen?')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {get<Array<{icon?: string; title: string; desc: string}>>('landing.backoffice.problem.items', [
                { title: 'Explodierende Personalkosten', desc: 'Lokale Backoffice-Kräfte werden immer teurer bei gleichzeitig sinkender Verfügbarkeit' },
                { title: 'Überlastete Teams', desc: 'Administrative Aufgaben fressen Zeit, die für Kerngeschäft und Wachstum fehlt' },
                { title: 'Schwierige Skalierung', desc: 'Bei Wachstum schnell qualifiziertes Personal zu finden wird zum Engpass' }
              ]).map((p, i) => (
                <Card key={i} className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                  <div className="text-red-500 mb-4">
                    {i===0 ? <Calculator className="w-8 h-8 mx-auto" /> : i===1 ? <Clock className="w-8 h-8 mx-auto" /> : <Users className="w-8 h-8 mx-auto" />}
                  </div>
                  <h3 className="font-bold mb-3">{p.title}</h3>
                  <p className="text-muted-foreground text-sm">{p.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.backoffice.how.title', "So funktioniert's: Ihre Backoffice-Fachkraft in 3 einfachen Schritten")}
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-3">{t('landing.backoffice.how.0.title', 'Anfrage über unsere Platform erstellen')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('landing.backoffice.how.0.text', 'Loggen Sie sich in unser System ein und definieren Sie Ihre Backoffice-Anforderungen. Wählen Sie Aufgabenbereiche, Qualifikationen, Arbeitszeiten und Sprachkenntnisse über unsere intuitive Benutzeroberfläche.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-3">{t('landing.backoffice.how.1.title', 'Automatisches Matching & Kandidatenauswahl')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('landing.backoffice.how.1.text', 'Unser System matched automatisch passende Backoffice-Profis aus unserem Pool. Sie erhalten binnen 48h eine Liste mit 3-5 qualifizierten Kandidaten zur Auswahl direkt in der Platform.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-3">{t('landing.backoffice.how.2.title', 'Interview & Produktiver Start')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('landing.backoffice.how.2.text', 'Terminbuchung und Interview-Koordination laufen über die Platform. Nach Ihrer Entscheidung übernehmen wir Verträge, Onboarding und Tool-Setup. Start binnen 2-4 Wochen.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stack */}
      <section className="py-16 bg-gradient-subtle overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 animate-fade-in">
              {t('landing.backoffice.trust.title', 'Über 30 Unternehmen optimieren bereits ihr Backoffice')}
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
                      {t('landing.backoffice.testimonials.0', '"Dank Remote-Buchhaltung sparen wir monatlich €2.800 und haben endlich Zeit für unser Kerngeschäft. Top!"')}
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
                      {t('landing.backoffice.testimonials.1', '"Die hervorragende Arbeit von einem neuen Kollegen hat uns überzeugt, eine zweite HejTalent-Kraft ins Team zu holen."')}
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
              <span className="font-semibold text-lg hover:scale-110 transition-transform duration-300">4,8 / 5</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors duration-300">{t('landing.backoffice.reviews.caption', 'aus 42 Bewertungen')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.backoffice.faq.title', 'Häufig gestellte Fragen')}
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="tasks" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-1 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.faq.items.0.q', 'Welche Backoffice-Aufgaben können übernommen werden?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.backoffice.faq.items.0.a', 'Buchhaltung, Rechnungswesen, Dateneingabe, Kundenservice, Administrative Tätigkeiten, CRM-Pflege, E-Mail-Support, Terminkoordination und vieles mehr.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-2 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.faq.items.1.q', 'Wie wird die Qualität der Arbeit sichergestellt?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.backoffice.faq.items.1.a', 'Alle Fachkräfte haben mind. 3 Jahre Berufserfahrung, werden durch uns geprüft und erhalten ein strukturiertes Onboarding. Regelmäßige Qualitätskontrollen inklusive.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="communication" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-3 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.faq.items.2.q', 'Wie funktioniert die Kommunikation?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.backoffice.faq.items.2.a', 'Kommunikation läuft über Ihre bevorzugten Tools (Teams, Slack, E-Mail). Überschneidung mit europäischen Arbeitszeiten garantiert.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scaling" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-4 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.faq.items.3.q', 'Kann ich die Arbeitszeit flexibel anpassen?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.backoffice.faq.items.3.a', 'Ja, von 10 Stunden pro Woche bis Vollzeit. Sie können jederzeit nach oben oder unten skalieren, je nach Ihren aktuellen Bedürfnissen.')}
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-12 bg-brand-dark text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={hejTalentLogo} alt="Hej Talent" className="h-8 mb-4 filter brightness-0 invert" />
              <p className="text-sm opacity-80">
                {t('landing.backoffice.footer.tagline', 'Remote Backoffice-Fachkräfte für deutsche Unternehmen')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('landing.backoffice.footer.solutions', 'Lösungen')}</h4>
              <div className="space-y-2 text-sm opacity-80">
                {get<string[]>('landing.backoffice.footer.solutionItems', ['Buchhaltung Remote','Kundenservice','Administrative Unterstützung','Dateneingabe']).map((s, i) => (
                  <div key={i}>{s}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('landing.backoffice.footer.company', 'Unternehmen')}</h4>
              <div className="space-y-2 text-sm opacity-80">
                {get<string[]>('landing.backoffice.footer.companyItems', ['Über uns','Karriere','Partner werden','Kontakt']).map((s, i) => (
                  <div key={i}>{s}</div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('landing.backoffice.footer.contact', 'Kontakt')}</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>hello@hejtalent.de</div>
                <div>+49 30 12345678</div>
                <div>Berlin, Deutschland</div>
                <div className="flex gap-2 mt-4">
                  <Linkedin className="w-5 h-5 hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-60">
            <p>© 2024 Hej Talent. {t('landing.backoffice.footer.rights', 'Alle Rechte vorbehalten.')}</p>
            <div className="flex justify-center gap-6 mt-2">
              <span className="hover:opacity-100 transition-opacity duration-300">{t('footer.links.privacy', 'Datenschutz')}</span>
              <span className="hover:opacity-100 transition-opacity duration-300">{t('footer.links.imprint', 'Impressum')}</span>
              <span className="hover:opacity-100 transition-opacity duration-300">{t('landing.backoffice.footer.terms', 'AGB')}</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default BackofficeLanding;