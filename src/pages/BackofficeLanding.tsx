import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MiniTeamSection } from '@/components/MiniTeamSection';
import FacebookPixel, { trackEvent } from '@/components/FacebookPixel';

import { Play, Star, CheckCircle, Users, Clock, Shield, Calendar, Linkedin, Calculator, Clock3, Headphones } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import customerLogos from '@/assets/customer-logos.png';
import verifiedBadge from '@/assets/verified-badge.png';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';
import { useTranslation } from '@/i18n/i18n';
import { RaasInquiryDialog } from '@/components/RaasInquiryDialog';

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
      <FacebookPixel />
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

            <RaasInquiryDialog
              source="backoffice-landing-hero"
              trigger={
                <Button
                  variant="cta"
                  size="xl"
                  className="mb-16 animate-fade-in-delay-3 hover:scale-105 relative overflow-hidden"
                  onClick={() => {
                    trackEvent('InitiateCheckout', {
                      content_name: 'RaaS Anfrage',
                      value: 0,
                      currency: 'EUR'
                    });
                    localStorage.setItem('raas_lead_intent', JSON.stringify({
                      timestamp: Date.now(),
                      source: 'backoffice-landing',
                      content: 'RaaS CTA Click'
                    }));
                  }}
                >
                  <span className="relative z-10">
                    {t('landing.backoffice.hero.cta', 'RaaS Anfrage stellen')}
                  </span>
                  <div className="absolute inset-0 bg-shimmer animate-shimmer bg-200%"></div>
                </Button>
              }
            />

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

      {/* Target Audience Section - Für wen? */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.backoffice.target.title', 'Für wen?')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-center mb-3 group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.target.0.title', 'KMUs & Mittelstand')}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t('landing.backoffice.target.0.desc', 'Unternehmen, die Backoffice-Kosten senken und sich auf Kerngeschäft fokussieren wollen')}
                </p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-center mb-3 group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.target.1.title', 'Steuerberater & Buchhalter')}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t('landing.backoffice.target.1.desc', 'Kanzleien, die ihr Team skalieren möchten ohne lokale Fixkosten')}
                </p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Headphones className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-center mb-3 group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.target.2.title', 'E-Commerce & Online-Händler')}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t('landing.backoffice.target.2.desc', 'Shops, die Kundenservice und Admin-Aufgaben professionell abdecken wollen')}
                </p>
              </Card>

              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-center mb-3 group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.target.3.title', 'Wachsende Startups')}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t('landing.backoffice.target.3.desc', 'Teams, die schnell und flexibel Backoffice-Kapazitäten aufbauen müssen')}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Specialists Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-4 animate-fade-in">
              {t('landing.backoffice.specialists.title', 'Unsere Remote-Fachkräfte')}
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t('landing.backoffice.specialists.subtitle', 'Qualifizierte Experten für alle Ihre Backoffice-Bedürfnisse')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                  <Calculator className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-xl text-center mb-4 group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.specialists.accounting.title', 'Buchhaltung & Finanzen')}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.accounting.0', 'Finanzbuchhaltung (FIBU)')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.accounting.1', 'Debitoren & Kreditoren')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.accounting.2', 'Lohnbuchhaltung')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.accounting.3', 'Controlling & Reporting')}</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300">
                  <Headphones className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-center mb-4 group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.specialists.support.title', 'Kundenservice & Support')}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.support.0', 'E-Mail Support (DE/EN)')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.support.1', 'Telefon-Hotline')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.support.2', 'Chat-Support & Ticketing')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.support.3', 'CRM-Management')}</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                  <Clock3 className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-xl text-center mb-4 group-hover:text-primary transition-colors duration-300">
                  {t('landing.backoffice.specialists.admin.title', 'Administration & Assistenz')}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.admin.0', 'Datenpflege & Eingabe')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.admin.1', 'Terminkoordination')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.admin.2', 'Dokumentenmanagement')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{t('landing.backoffice.specialists.admin.3', 'Virtuelle Assistenz')}</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Ihre Vorteile */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              {t('landing.backoffice.benefits.title', 'Ihre Vorteile')}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{t('landing.backoffice.benefits.0.title', '40-60% Kostenersparnis')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.backoffice.benefits.0.text', 'Sparen Sie bis zu €30.000 pro Jahr pro Fachkraft gegenüber lokalen Mitarbeitern')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{t('landing.backoffice.benefits.1.title', 'Schneller Start')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.backoffice.benefits.1.text', 'Qualifizierte Fachkraft produktiv in 2-4 Wochen statt monatelanger Suche')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{t('landing.backoffice.benefits.2.title', 'Geprüfte Qualität')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.backoffice.benefits.2.text', 'Alle Fachkräfte durchlaufen mehrstufigen Screening-Prozess und Qualitätschecks')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{t('landing.backoffice.benefits.3.title', 'Flexible Skalierung')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.backoffice.benefits.3.text', 'Von 10h/Woche bis Vollzeit – passen Sie Kapazität jederzeit an')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{t('landing.backoffice.benefits.4.title', 'DSGVO-konform')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.backoffice.benefits.4.text', 'Alle Prozesse entsprechen deutschen Datenschutz- und Compliance-Standards')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{t('landing.backoffice.benefits.5.title', 'Deutscher Support')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.backoffice.benefits.5.text', 'Persönlicher Account Manager betreut Sie während der gesamten Zusammenarbeit')}
                    </p>
                  </div>
                </div>
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

      {/* Solution Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6 animate-fade-in">
              {t('landing.backoffice.solution.title', 'Die Lösung: Geprüfte Backoffice-Fachkräfte in 48 Stunden')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-3">{t('landing.backoffice.solution.0.title', '48h Perfect Match')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.backoffice.solution.0.text', 'Aus 500+ geprüften Backoffice-Profis finden wir in 48h den perfekten Match für Ihre Anforderungen')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-3">{t('landing.backoffice.solution.1.title', '95% Erfolgsquote')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.backoffice.solution.1.text', 'Unser Screening-Prozess garantiert höchste Qualität – nur die besten 5% werden zugelassen')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-3">{t('landing.backoffice.solution.2.title', 'Start in 2-4 Wochen')}</h3>
                <p className="text-muted-foreground">
                  {t('landing.backoffice.solution.2.text', 'Nach dem Match: Onboarding, Tool-Setup und produktive Arbeit binnen 2-4 Wochen')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6 animate-fade-in">
              {t('landing.backoffice.pricing.title', 'Sparen Sie 40-60% gegenüber lokalen Mitarbeitern')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8 bg-white border-2">
                <h3 className="font-bold text-xl mb-4 text-red-600">{t('landing.backoffice.pricing.local.title', 'Traditionell (lokal)')}</h3>
                <div className="text-4xl font-bold mb-6">€3.500-5.000<span className="text-lg font-normal text-muted-foreground">/Monat</span></div>
                <div className="space-y-3 text-left text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.pricing.local.0', 'Hohe Fixkosten + Nebenkosten')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.pricing.local.1', 'Bürofläche erforderlich')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.pricing.local.2', 'Lange Kündigungsfristen')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.pricing.local.3', 'Schwierige Skalierung')}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-primary/5 border-2 border-primary relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                  {t('landing.backoffice.pricing.raas.badge', 'Empfohlen')}
                </div>
                <h3 className="font-bold text-xl mb-4 text-primary">{t('landing.backoffice.pricing.raas.title', 'RaaS (Remote)')}</h3>
                <div className="text-4xl font-bold mb-6 text-primary">€1.800-2.500<span className="text-lg font-normal text-muted-foreground">/Monat</span></div>
                <div className="space-y-3 text-left text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.pricing.raas.0', '40-60% Kostenersparnis')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.pricing.raas.1', 'Keine Bürokosten')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.pricing.raas.2', 'Flexible Skalierung')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.pricing.raas.3', 'Geprüfte Qualität')}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
              <p className="text-lg font-semibold text-brand-dark">
                {t('landing.backoffice.pricing.savings', '💰 Ersparnis: €20.000 - €30.000 pro Jahr und Mitarbeiter')}
              </p>
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
                      {t('landing.backoffice.testimonials.1', '"Die hervorragende Arbeit von einem neuen Kollegen hat uns überzeugt, eine zweite Hej Talent-Kraft ins Team zu holen."')}
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

      {/* Guarantee Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-6 animate-fade-in">
              {t('landing.backoffice.guarantee.title', '🛡️ Unsere Zufriedenheitsgarantie')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="p-6 bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-3">{t('landing.backoffice.guarantee.moneyBack.title', '14 Tage Geld-zurück')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('landing.backoffice.guarantee.moneyBack.text', 'Nicht zufrieden? 100% Rückerstattung ohne Fragen in den ersten 14 Tagen')}
                </p>
              </Card>

              <Card className="p-6 bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-3">{t('landing.backoffice.guarantee.replacement.title', 'Kostenloser Ersatz')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('landing.backoffice.guarantee.replacement.text', 'Stimmt die Chemie nicht? Wir finden kostenfrei eine neue Fachkraft')}
                </p>
              </Card>

              <Card className="p-6 bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold mb-3">{t('landing.backoffice.guarantee.match.title', '48h Match-Garantie')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('landing.backoffice.guarantee.match.text', 'Kein passender Kandidat in 48h? Service komplett kostenfrei')}
                </p>
              </Card>
            </div>

            <div className="bg-white p-8 rounded-xl border-l-4 border-green-500">
              <h3 className="font-bold text-lg mb-4">{t('landing.backoffice.guarantee.why.title', 'Warum können wir das garantieren?')}</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold mb-2">📊 {t('landing.backoffice.guarantee.why.successRate.title', '95% Erfolgsquote')}</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t('landing.backoffice.guarantee.why.successRate.text', 'Über 400 erfolgreiche Matches in den letzten 2 Jahren')}
                  </p>
                  
                  <h4 className="font-semibold mb-2">🔍 {t('landing.backoffice.guarantee.why.screening.title', 'Rigoroser Screening')}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t('landing.backoffice.guarantee.why.screening.text', 'Nur 5% aller Bewerber bestehen unseren mehrstufigen Prüfprozess')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">🎯 {t('landing.backoffice.guarantee.why.matching.title', 'Präzises Matching')}</h4>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t('landing.backoffice.guarantee.why.matching.text', 'Algorithmus analysiert Fähigkeiten, Erfahrung und Arbeitsweise')}
                  </p>
                  
                  <h4 className="font-semibold mb-2">📞 {t('landing.backoffice.guarantee.why.support.title', 'Persönlicher Support')}</h4>
                  <p className="text-muted-foreground text-sm">
                    {t('landing.backoffice.guarantee.why.support.text', 'Deutscher Account Manager betreut Sie während der gesamten Zusammenarbeit')}
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
              {t('landing.backoffice.urgency.title', '⚠️ Warum Sie JETZT handeln sollten')}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 bg-white">
                <h3 className="font-bold mb-4 text-red-600">{t('landing.backoffice.urgency.without.title', 'Ohne Hej Talent:')}</h3>
                <div className="space-y-3 text-left text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.urgency.without.0', 'Monatelange Suche nach geeignetem Personal')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.urgency.without.1', '€40.000+ jährliche Mehrkosten pro Mitarbeiter')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.urgency.without.2', 'Überlastete Teams und verpasste Chancen')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>{t('landing.backoffice.urgency.without.3', 'Schwierige Skalierung bei Wachstum')}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-green-50 border-2 border-green-500">
                <h3 className="font-bold mb-4 text-green-600">{t('landing.backoffice.urgency.with.title', 'Mit Hej Talent:')}</h3>
                <div className="space-y-3 text-left text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.urgency.with.0', 'Qualifizierte Fachkraft in 2-4 Wochen')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.urgency.with.1', '€20.000-30.000 Ersparnis pro Jahr')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.urgency.with.2', 'Entlastung für Ihr Kernteam')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('landing.backoffice.urgency.with.3', 'Flexible Skalierung jederzeit möglich')}</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-white p-6 rounded-xl border-l-4 border-primary">
              <p className="text-lg font-semibold text-brand-dark mb-2">
                {t('landing.backoffice.urgency.cta.text', '⏰ Jeder Monat ohne optimierte Backoffice-Prozesse kostet Sie Zeit und Geld')}
              </p>
              <p className="text-muted-foreground mb-6">
                {t('landing.backoffice.urgency.cta.subtext', 'Starten Sie jetzt und konzentrieren Sie sich auf Ihr Kerngeschäft!')}
              </p>
              
              <RaasInquiryDialog
                source="backoffice-landing-urgency"
                trigger={
                  <Button
                    variant="cta"
                    size="xl"
                    className="animate-pulse hover:scale-105"
                    onClick={() => {
                      trackEvent('InitiateCheckout', {
                        content_name: 'RaaS Anfrage',
                        value: 0,
                        currency: 'EUR'
                      });
                      localStorage.setItem('raas_lead_intent', JSON.stringify({
                        timestamp: Date.now(),
                        source: 'backoffice-landing-urgency',
                        content: 'Urgency Section CTA'
                      }));
                    }}
                  >
                    {t('landing.backoffice.urgency.cta.button', 'Jetzt starten & sparen')}
                  </Button>
                }
              />
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