import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Play, Star, CheckCircle, Users, Clock, Shield, Calendar, Linkedin, Code, Zap, Gauge } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import customerLogos from '@/assets/customer-logos.png';
import verifiedBadge from '@/assets/verified-badge.png';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';
import { useTranslation } from '@/i18n/i18n';

const ITDevelopmentLanding = () => {
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
          {get<string[]>('landing.itDev.ticker', [
            '30-50% günstiger',
            'Start in 7-14 Tagen',
            'Senior Entwickler',
            'Alle Technologien',
            'Keine Headhunter-Fee',
            'Geld-zurück-Garantie'
          ]).map((text, idx) => (
            <span key={`ticker-a-${idx}`} className="flex items-center gap-3 text-sm font-medium text-brand-dark">
              {text} <span className="text-primary text-lg">•</span>
            </span>
          ))}
          {get<string[]>('landing.itDev.ticker', []).map((text, idx) => (
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
              <span className="text-primary">RaaS</span> {t('landing.itDev.hero.title', '- Senior IT-Entwickler')}{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary-hover bg-clip-text animate-shimmer bg-shimmer bg-200% animate-bounce-in-delay-1">
                {t('landing.itDev.hero.badge', '30-50% günstiger')}
              </span> {t('landing.itDev.hero.trailing', 'als lokale Talente')}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto animate-fade-in-delay-1">
              <strong>Resources as a Service</strong> – {t('landing.itDev.hero.p1', 'Unser bewährtes RaaS-System macht es einfach: Sie beschreiben Ihr IT-Projekt, wir liefern die perfekte Entwickler-Lösung.')}
            </p>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-delay-1">
              {t('landing.itDev.hero.p2', 'Entdecken Sie, wie Sie in 7-14 Tagen hochqualifizierte Senior-Entwickler für React, Node.js, Python & mehr aus unserem geprüften Netzwerk bekommen – remote und sofort produktiv.')}
            </p>

            {/* Video Player */}
            <div className="relative mb-12 animate-slide-up-delay-2">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto group hover:shadow-3xl transition-all duration-700 hover:scale-[1.02]">
                <div className="aspect-video bg-black flex items-center justify-center">
                  <iframe
                    src="https://drive.google.com/file/d/1UafXr5rs1cjntZ4cuAzSSk5D_lpwP-Mp/preview"
                    title="IT-Entwickler RaaS Video"
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
                  {t('landing.itDev.hero.cta', 'RaaS Anfrage stellen')}
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
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.itDev.bullets.0.title', 'Senior-Level Expertise')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.itDev.bullets.0.text', 'Nur Entwickler mit 5+ Jahren Erfahrung und nachgewiesenen Skills in modernen Technologien')}
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
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.itDev.bullets.1.title', 'Schneller Start')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.itDev.bullets.1.text', 'Perfekter Match in 48h, Onboarding in 7-14 Tagen – produktiv ab Tag 1')}
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
                    <Gauge className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">{t('landing.itDev.bullets.2.title', 'Bewährtes Matching')}</h3>
                  <p className="text-muted-foreground">
                    {t('landing.itDev.bullets.2.text', '97% Erfolgsquote durch präzises Technical Screening und Kultur-Fit-Tests')}
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
              {t('landing.itDev.problem.title', 'Kennen Sie diese IT-Herausforderungen?')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {get<Array<{title: string; desc: string}>>('landing.itDev.problem.items', [
                { title: 'Monatelange Suche', desc: '6+ Monate Recruiting für einen Senior-Entwickler – Projekte verzögern sich, Deadlines platzen' },
                { title: 'Überteuerte Freelancer', desc: '€120+/h für mittelmäßige Freelancer – Budget explodiert, Qualität enttäuscht' },
                { title: 'Unzuverlässige Agenturen', desc: 'Hohe Headhunter-Fees, schlechte Matches, keine Garantien – Geld weg, Problem bleibt' }
              ]).map((p, i) => (
                <Card key={i} className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                  <div className="text-red-500 mb-4">
                    {i===0 ? <Clock className="w-8 h-8 mx-auto" /> : i===1 ? <Users className="w-8 h-8 mx-auto" /> : <Shield className="w-8 h-8 mx-auto" />}
                  </div>
                  <h3 className="font-bold mb-3">{p.title}</h3>
                  <p className="text-muted-foreground text-sm">{p.desc}</p>
                </Card>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl border-l-4 border-red-500">
              <p className="text-lg font-semibold text-brand-dark mb-2">
                {t('landing.itDev.problem.resultTitle', 'Das Resultat: Verpasste Opportunities, frustrierte Teams, explodierende Kosten')}
              </p>
              <p className="text-muted-foreground">
                {t('landing.itDev.problem.resultText', 'Während Sie nach dem perfekten Entwickler suchen, überholt Sie die Konkurrenz mit fertigen Produkten.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6 animate-fade-in">
              {t('landing.itDev.solution.title', 'Die Lösung: Geprüfte Senior-Entwickler in 48 Stunden')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-3">{t('landing.itDev.solution.0.title', '48h Perfect Match')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.itDev.solution.0.text', 'Aus 1.000+ geprüften Entwicklern finden wir in 48h den perfekten Match für Ihr Projekt')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gauge className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-3">{t('landing.itDev.solution.1.title', '97% Erfolgsquote')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.itDev.solution.1.text', 'Unser 3-stufiger Prüfprozess garantiert höchste Qualität – nur 3% aller Bewerber bestehen')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-3">{t('landing.itDev.solution.2.title', 'Start in 7 Tagen')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.itDev.solution.2.text', 'Nach dem Match: Onboarding, Setup und produktive Arbeit binnen einer Woche')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.itDev.how.title', "So funktioniert's: Ihr Entwickler in 3 einfachen Schritten")}
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-3">{t('landing.itDev.how.0.title', 'Anfrage über unsere Platform erstellen')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('landing.itDev.how.0.text', 'Loggen Sie sich in unser System ein und erstellen Sie eine detaillierte Suchanfrage. Definieren Sie Technologie-Stack, Erfahrungslevel, Projektdauer und spezielle Anforderungen direkt in der Benutzeroberfläche.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-3">{t('landing.itDev.how.1.title', 'KI-Matching & Kandidaten-Review')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('landing.itDev.how.1.text', 'Unser System analysiert Ihre Anfrage und matched automatisch passende Kandidaten aus unserem Talent-Pool. Sie erhalten binnen 48h eine kuratierte Liste mit 3-5 Top-Matches direkt in der Platform.')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-3">{t('landing.itDev.how.2.title', 'Interview-Management & Onboarding')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('landing.itDev.how.2.text', 'Terminbuchung, Interview-Koordination und Vertragsabwicklung laufen komplett über die Platform. Nach Ihrer Auswahl kümmern wir uns um das komplette Onboarding und Setup.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.itDev.tech.title', 'Alle Technologien, die Sie brauchen')}
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <h3 className="font-bold mb-4">{t('landing.itDev.tech.frontend', 'Frontend')}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>React.js & Next.js</div>
                  <div>Vue.js & Nuxt.js</div>
                  <div>Angular</div>
                  <div>TypeScript</div>
                  <div>Tailwind CSS</div>
                </div>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <h3 className="font-bold mb-4">{t('landing.itDev.tech.backend', 'Backend')}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Node.js & Express</div>
                  <div>Python & Django</div>
                  <div>.NET & C#</div>
                  <div>Java & Spring</div>
                  <div>PHP & Laravel</div>
                </div>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <h3 className="font-bold mb-4">{t('landing.itDev.tech.mobile', 'Mobile')}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>React Native</div>
                  <div>Flutter</div>
                  <div>Swift (iOS)</div>
                  <div>Kotlin (Android)</div>
                  <div>Xamarin</div>
                </div>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
                <h3 className="font-bold mb-4">{t('landing.itDev.tech.devops', 'Cloud & DevOps')}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>AWS & Azure</div>
                  <div>Docker & Kubernetes</div>
                  <div>CI/CD Pipelines</div>
                  <div>Terraform</div>
                  <div>Monitoring & Logging</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.itDev.cases.title', 'Erfolgsgeschichten unserer Kunden')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-blue-600">FT</span>
                  </div>
                  <div>
                    <h3 className="font-bold">FinTech Startup München</h3>
                    <p className="text-sm text-muted-foreground">Series A, 50 Mitarbeiter</p>
                  </div>
                </div>
                
                <h4 className="font-bold mb-3">Challenge:</h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  Dringende Erweiterung der Trading-Platform. React Frontend + Node.js Backend. 
                  Lokale Entwickler: 8 Monate Wartezeit, €140/h.
                </p>
                
                <h4 className="font-bold mb-3">Lösung:</h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  2 Senior React-Entwickler + 1 Backend-Spezialist in 3 Tagen gefunden. 
                  Start nach 1 Woche, €55/h.
                </p>
                
                <h4 className="font-bold mb-3">Ergebnis:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>€180.000 Kosteneinsparung/Jahr</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>6 Monate früher am Markt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>MVP in 8 Wochen statt 6 Monaten</span>
                  </div>
                </div>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-green-600">EC</span>
                  </div>
                  <div>
                    <h3 className="font-bold">E-Commerce Scaleup Berlin</h3>
                    <p className="text-sm text-muted-foreground">€50M ARR, 200+ Mitarbeiter</p>
                  </div>
                </div>
                
                <h4 className="font-bold mb-3">Challenge:</h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  Mobile App (React Native) + Microservices Migration. 
                  Agentur wollte €300k, Freelancer nicht verfügbar.
                </p>
                
                <h4 className="font-bold mb-3">Lösung:</h4>
                <p className="text-muted-foreground mb-4 text-sm">
                  4-köpfiges Team: React Native, Node.js, DevOps, QA. 
                  Gesamtkosten: €75/h Blended Rate.
                </p>
                
                <h4 className="font-bold mb-3">Ergebnis:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>€150.000 vs. €300.000 Agentur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>App Store Launch in 12 Wochen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Team übernommen nach Projekt</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6 animate-fade-in">
              {t('landing.itDev.guarantee.title', 'Unsere 100% Erfolgs-Garantie')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-3">14 Tage Geld-zurück</h3>
                <p className="text-muted-foreground text-sm">
                  {t('landing.itDev.guarantee.14Days', 'Nicht zufrieden? 100% Rückerstattung ohne Fragen in den ersten 14 Tagen')}
                </p>
              </Card>

              <Card className="p-6 bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-3">Kostenloser Ersatz</h3>
                <p className="text-muted-foreground text-sm">
                  {t('landing.itDev.guarantee.freeSubstitute', 'Stimmt die Chemie nicht? Wir finden kostenfrei einen neuen Kandidaten')}
                </p>
              </Card>

              <Card className="p-6 bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-3">48h Match-Garantie</h3>
                <p className="text-muted-foreground text-sm">
                  {t('landing.itDev.guarantee.48hMatch', 'Kein passender Kandidat in 48h? Service komplett kostenfrei')}
                </p>
              </Card>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-green-500">
              <h3 className="font-bold text-lg mb-4">Warum können wir das garantieren?</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2">📊 97% Erfolgsquote</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t('landing.itDev.guarantee.successRate', 'Über 850 erfolgreiche Matches in den letzten 2 Jahren')}
                  </p>
                  
                  <h4 className="font-semibold mb-2">🔍 Rigoroser Screening</h4>
                  <p className="text-muted-foreground text-sm">
                    {t('landing.itDev.guarantee.rigorousScreening', 'Nur 3% aller Bewerber bestehen unseren 3-stufigen Prüfprozess')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 KI-Matching</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t('landing.itDev.guarantee.kiMatching', 'Algorithmus analysiert Techstack, Erfahrung und Kultur-Fit')}
                  </p>
                  
                  <h4 className="font-semibold mb-2">📞 Persönlicher Support</h4>
                  <p className="text-muted-foreground text-sm">
                    {t('landing.itDev.guarantee.personalSupport', 'Deutscher Account Manager betreut Sie während der gesamten Zusammenarbeit')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-16 bg-red-50 border-l-4 border-red-500">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6 animate-fade-in">
              {t('landing.itDev.urgency.title', '⚠️ Warum Sie JETZT handeln sollten')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 bg-white">
                <h3 className="font-bold mb-4 text-red-600">Ohne Hej Talent:</h3>
                <div className="space-y-3 text-left text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.noHejTalent.0', '6+ Monate Recruiting-Prozess')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.noHejTalent.1', 'Überteuerte Agenturen')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.noHejTalent.2', 'Verpasste Market Windows')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.noHejTalent.3', 'Überlastetes internes Team')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.noHejTalent.4', 'Verzögerte Produktentwicklung')}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-green-200">
                <h3 className="font-bold mb-4 text-green-600">Mit Hej Talent:</h3>
                <div className="space-y-3 text-left text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.withHejTalent.0', 'Entwickler in 48h matched')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.withHejTalent.1', 'Transparente Platform-Preise')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.withHejTalent.2', 'Schneller am Markt')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.withHejTalent.3', 'Team kann sich auf Kerngeschäft fokussieren')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{t('landing.itDev.urgency.withHejTalent.4', 'Kontinuierliche Innovation')}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-orange-500">
              <h3 className="font-bold text-lg mb-4">🔥 Begrenzte Verfügbarkeit</h3>
              <p className="text-muted-foreground mb-4">
                {t('landing.itDev.urgency.limitedAvailability', 'Wir arbeiten nur mit 50 Kunden gleichzeitig, um höchste Qualität zu garantieren. Aktuell sind noch')} <strong className="text-primary">{t('landing.itDev.urgency.availableSlots', '7 Plätze')}</strong> {t('landing.itDev.urgency.availableSlotsTrailing', 'verfügbar.')}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>{t('landing.itDev.urgency.nextAvailability', 'Nächste freie Kapazitäten:')}</strong> {t('landing.itDev.urgency.nextAvailabilityDate', 'Februar 2025')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 animate-bounce-in">
            {t('landing.itDev.finalCta.title', 'Starten Sie HEUTE mit Ihrem neuen Entwickler-Team')}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90 animate-fade-in-delay-1">
            {t('landing.itDev.finalCta.text', 'Buchen Sie jetzt Ihr kostenloses 15-Minuten-Gespräch und bekommen Sie in 48h Ihren perfekten Senior-Entwickler präsentiert – garantiert.')}
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <Button variant="secondary" size="xl" className="animate-scale-in-delay-2 hover:scale-110 transition-transform duration-300">
              🚀 {t('landing.itDev.finalCta.ctaButton', 'Kostenloses Gespräch buchen')}
            </Button>
            <Button variant="outline" size="xl" className="text-white border-white hover:bg-white hover:text-primary animate-scale-in-delay-3">
              📋 {t('landing.itDev.finalCta.requirementsButton', 'Anforderungen schicken')}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{t('landing.itDev.finalCta.badges.0', 'Keine Verpflichtung')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{t('landing.itDev.finalCta.badges.1', 'Sofort verfügbar')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{t('landing.itDev.finalCta.badges.2', '14 Tage Garantie')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stack */}
      <section className="py-16 bg-gradient-subtle overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 animate-fade-in">
              {t('landing.itDev.trust.title', 'Über 80 Tech-Unternehmen vertrauen unseren Entwicklern')}
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
                      {t('landing.itDev.trust.review1', '"Hej Talent hat uns innerhalb von 2 Wochen die perfekte Remote-Buchhalterin vermittelt. Professionell und zuverlässig."')}
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">{t('landing.itDev.trust.review1Author', 'Niklas Clasen, CEO SNIPE Solutions')}</div>
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
                      {t('landing.itDev.trust.review2', '"Die hervorragende Arbeit von einem neuen Kollegen hat uns überzeugt, eine zweite HejTalent-Kraft ins Team zu holen."')}
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">{t('landing.itDev.trust.review2Author', 'Marc Palma, Geschäftsführer, ECO Containertrans')}</div>
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
              <span className="text-muted-foreground hover:text-foreground transition-colors duration-300">{t('landing.itDev.trust.ratingTrailing', 'aus 73 Bewertungen')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.itDev.faq.title', 'Häufig gestellte Fragen')}
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="technologies" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-1 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.itDev.faq.items.0.q', 'Welche Technologien beherrschen Ihre Entwickler?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.itDev.faq.items.0.a', 'Frontend: React, Vue.js, Angular, TypeScript. Backend: Node.js, Python, Java, .NET. Mobile: React Native, Flutter. Datenbanken: PostgreSQL, MongoDB, MySQL. Cloud: AWS, Azure, GCP.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="experience" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-2 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.itDev.faq.items.1.q', 'Wie erfahren sind die Entwickler?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.itDev.faq.items.1.a', 'Alle haben mindestens 5 Jahre Berufserfahrung. Viele kommen aus Consulting-Unternehmen oder Product Companies. Durchschnittlich 8+ Jahre Erfahrung mit modernen Tech-Stacks.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="communication" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-3 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.itDev.faq.items.2.q', 'Wie funktioniert die Zusammenarbeit remote?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.itDev.faq.items.2.a', 'Zeitzone EU/MEZ, tägliche Standups, Ihre Tools (Jira, Slack, GitLab). Agile Arbeitsweise, 4-6h Überschneidung mit europäischen Arbeitszeiten garantiert.')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="testing" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-4 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  {t('landing.itDev.faq.items.3.q', 'Kann ich den Entwickler vorher testen?')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  {t('landing.itDev.faq.items.3.a', 'Ja! Nach dem Matching führen Sie ein Technical Interview. Dann 14-tägige Testphase mit Geld-zurück-Garantie. Passt es nicht, suchen wir kostenfrei einen neuen Kandidaten.')}
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
                {t('landing.itDev.footer.tagline', 'Senior IT-Entwickler für deutsche Unternehmen')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('landing.itDev.footer.tech', 'Technologien')}</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>React & Vue.js</div>
                <div>Node.js & Python</div>
                <div>Mobile Development</div>
                <div>Cloud & DevOps</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('landing.itDev.footer.company', 'Unternehmen')}</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>Über uns</div>
                <div>Karriere</div>
                <div>Partner werden</div>
                <div>Kontakt</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('landing.itDev.footer.contact', 'Kontakt')}</h4>
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
            <p>© 2024 Hej Talent. {t('landing.itDev.footer.rights', 'Alle Rechte vorbehalten.')}</p>
            <div className="flex justify-center gap-6 mt-2">
              <span className="hover:opacity-100 transition-opacity duration-300">{t('footer.links.privacy', 'Datenschutz')}</span>
              <span className="hover:opacity-100 transition-opacity duration-300">{t('footer.links.imprint', 'Impressum')}</span>
              <span className="hover:opacity-100 transition-opacity duration-300">{t('landing.itDev.footer.terms', 'AGB')}</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ITDevelopmentLanding;