import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VideoModal } from '@/components/VideoModal';
import { Play, Star, CheckCircle, Users, Clock, Shield, Calendar, Linkedin, Calculator, Clock3, Headphones } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import customerLogos from '@/assets/customer-logos.png';
import verifiedBadge from '@/assets/verified-badge.png';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

const BackofficeLanding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoUnlocked, setIsVideoUnlocked] = useState(false);
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

  const handleVideoUnlock = () => {
    setIsVideoUnlocked(true);
  };

  const handleCTAClick = () => {
    setIsModalOpen(true);
  };

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
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            40-60% günstiger <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Start in 2-4 Wochen <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Geprüfte Backoffice-Profis <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Keine Headhunter-Fee <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Remote & DSGVO-konform <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Skalierung jederzeit möglich <span className="text-primary text-lg">•</span>
          </span>
          
          {/* Second set for seamless loop */}
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            40-60% günstiger <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Start in 2-4 Wochen <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Geprüfte Backoffice-Profis <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Keine Headhunter-Fee <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Remote & DSGVO-konform <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Skalierung jederzeit möglich <span className="text-primary text-lg">•</span>
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight animate-fade-in">
              <span className="text-primary">RaaS</span> - Remote Backoffice-Fachkräfte{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary-hover bg-clip-text animate-shimmer bg-shimmer bg-200% animate-bounce-in-delay-1">
                40-60% günstiger
              </span> als lokale Mitarbeiter
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto animate-fade-in-delay-1">
              <strong>Resources as a Service</strong> – Unser bewährtes RaaS-System macht es einfach: 
              Sie beschreiben Ihre Backoffice-Anforderungen, wir liefern die perfekte Fachkraft-Lösung.
            </p>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-delay-1">
              Entdecken Sie, wie Sie hochqualifizierte Backoffice-Profis für Buchhaltung, Admin und Kundenservice 
              aus unserem geprüften Netzwerk bekommen – remote, zuverlässig und DSGVO-konform.
            </p>

            {/* Video Thumbnail/Player */}
            <div className="relative mb-12 animate-slide-up-delay-2">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto group hover:shadow-3xl transition-all duration-700 hover:scale-[1.02]">
                {!isVideoUnlocked ? (
                  <>
                    <div className="relative">
                      <img 
                        src={videoThumbnail} 
                        alt="Video Thumbnail" 
                        className="w-full h-auto filter blur-sm opacity-80 group-hover:blur-none group-hover:opacity-90 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-500">
                        <div className="text-center animate-float">
                          <div className="w-24 h-24 bg-white bg-opacity-90 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl hover:bg-opacity-100 transition-all duration-300 animate-pulse-glow hover:scale-110">
                            <Play className="w-12 h-12 text-primary ml-1 animate-bounce" />
                          </div>
                          <p className="text-white text-lg font-semibold animate-fade-in-delay-3">
                            Backoffice-Lösung kennenlernen
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-black flex items-center justify-center animate-scale-in">
                    <iframe
                      src="https://drive.google.com/file/d/1YPJcKaFDr4BNvHxAOKd3obYIpWVuljbH/preview"
                      title="Backoffice Remote Fachkräfte Video"
                      className="w-full h-full"
                      allow="autoplay"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="cta"
              size="xl"
              onClick={handleCTAClick}
              className="mb-16 animate-bounce-in-delay-3 hover:animate-pulse relative overflow-hidden"
              disabled={isVideoUnlocked}
            >
              <span className="relative z-10">
                {isVideoUnlocked ? 'RaaS Anfrage bereits möglich' : 'RaaS Anfrage stellen'}
              </span>
              {!isVideoUnlocked && (
                <div className="absolute inset-0 bg-shimmer animate-shimmer bg-200%"></div>
              )}
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
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">Massive Kostenersparnis</h3>
                  <p className="text-muted-foreground">
                    Optimieren Sie Ihre Backoffice-Prozesse durch qualifizierte Remote-Fachkräfte
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
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">Flexibel skalieren</h3>
                  <p className="text-muted-foreground">
                    Von 10h/Woche bis Vollzeit – passen Sie die Kapazität jederzeit an Ihre Bedürfnisse an
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
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">Professionelle Kommunikation</h3>
                  <p className="text-muted-foreground">
                    Alle unsere Backoffice-Profis kommunizieren professionell und verstehen Ihre Arbeitsweise
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
              Kennen Sie diese Backoffice-Herausforderungen?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="text-red-500 mb-4">
                  <Calculator className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="font-bold mb-3">Explodierende Personalkosten</h3>
                <p className="text-muted-foreground text-sm">
                  Lokale Backoffice-Kräfte werden immer teurer bei gleichzeitig sinkender Verfügbarkeit
                </p>
              </Card>

              <Card className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="text-red-500 mb-4">
                  <Clock className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="font-bold mb-3">Überlastete Teams</h3>
                <p className="text-muted-foreground text-sm">
                  Administrative Aufgaben fressen Zeit, die für Kerngeschäft und Wachstum fehlt
                </p>
              </Card>

              <Card className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="text-red-500 mb-4">
                  <Users className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="font-bold mb-3">Schwierige Skalierung</h3>
                <p className="text-muted-foreground text-sm">
                  Bei Wachstum schnell qualifiziertes Personal zu finden wird zum Engpass
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              So funktioniert's: Ihre Backoffice-Fachkraft in 3 einfachen Schritten
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Anfrage über unsere Platform erstellen</h3>
                  <p className="text-muted-foreground mb-4">
                    Loggen Sie sich in unser System ein und definieren Sie Ihre Backoffice-Anforderungen. 
                    Wählen Sie Aufgabenbereiche, Qualifikationen, Arbeitszeiten und Sprachkenntnisse 
                    über unsere intuitive Benutzeroberfläche.
                  </p>
                  <div className="bg-white p-4 rounded-lg border">
                    <strong className="text-sm">Platform-Features:</strong> Aufgaben-Templates (Buchhaltung, Admin, Kundenservice), 
                    Qualifikations-Filter, Arbeitszeit-Planer, Sprachlevel-Auswahl
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Automatisches Matching & Kandidatenauswahl</h3>
                  <p className="text-muted-foreground mb-4">
                    Unser System matched automatisch passende Backoffice-Profis aus unserem Pool. 
                    Sie erhalten binnen 48h eine Liste mit 3-5 qualifizierten Kandidaten zur Auswahl 
                    direkt in der Platform.
                  </p>
                  <div className="bg-white p-4 rounded-lg border">
                    <strong className="text-sm">Sie sehen:</strong> Detaillierte CV's, Referenzen, Sprachzertifikate, 
                    Arbeitsproben, Verfügbarkeit und Motivation-Videos der Kandidaten
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Interview & Produktiver Start</h3>
                  <p className="text-muted-foreground mb-4">
                    Terminbuchung und Interview-Koordination laufen über die Platform. Nach Ihrer Entscheidung 
                    übernehmen wir Verträge, Onboarding und Tool-Setup. Start binnen 2-4 Wochen.
                  </p>
                  <div className="bg-white p-4 rounded-lg border">
                    <strong className="text-sm">Platform-Support:</strong> Kalender-Integration, Interview-Leitfäden, 
                    automatische Verträge, Onboarding-Workflows und direkter Support-Chat
                  </div>
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
              Über 30 Unternehmen optimieren bereits ihr Backoffice
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
                      "Unsere Buchhaltung läuft jetzt perfekt remote. Effizienz gestiegen und haben endlich Zeit für Kerngeschäft."
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">Thomas Schmidt, Geschäftsführer MedTech Solutions</div>
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
                      "Unser Kundenservice ist jetzt 12h täglich besetzt – bei halben Kosten. Kundenzufriedenheit auf Allzeithoch!"
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">Lisa Weber, COO ServicePlus GmbH</div>
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
              <span className="text-muted-foreground hover:text-foreground transition-colors duration-300">aus 42 Bewertungen</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12 animate-fade-in">
              Häufig gestellte Fragen
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="tasks" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-1 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Welche Backoffice-Aufgaben können übernommen werden?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Buchhaltung, Rechnungswesen, Dateneingabe, Kundenservice, Administrative Tätigkeiten, 
                  CRM-Pflege, E-Mail-Support, Terminkoordination und vieles mehr.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="quality" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-2 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Wie wird die Qualität der Arbeit sichergestellt?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Alle Fachkräfte haben mind. 3 Jahre Berufserfahrung, werden durch uns geprüft und 
                  erhalten ein strukturiertes Onboarding. Regelmäßige Qualitätskontrollen inklusive.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="communication" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-3 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Wie funktioniert die Kommunikation?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Kommunikation läuft über Ihre bevorzugten Tools (Teams, Slack, E-Mail). 
                  Überschneidung mit europäischen Arbeitszeiten garantiert.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scaling" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-4 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Kann ich die Arbeitszeit flexibel anpassen?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Ja, von 10 Stunden pro Woche bis Vollzeit. Sie können jederzeit nach oben oder 
                  unten skalieren, je nach Ihren aktuellen Bedürfnissen.
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </div>
      </section>

      {/* Secondary CTA Section (Only shown after video unlock) */}
      {isVideoUnlocked && (
        <section className="py-16 bg-primary text-white overflow-hidden animate-fade-in">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 animate-bounce-in">
              Bereit für Ihr Remote Backoffice-Team?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 animate-fade-in-delay-1">
              Lassen Sie uns in einem 15-minütigen Gespräch klären, wie wir Ihr Backoffice 
              optimieren und Ihre Kosten halbieren können.
            </p>
            <Button variant="secondary" size="xl" className="animate-scale-in-delay-2 hover:scale-110 transition-transform duration-300">
              Kostenlose Beratung buchen
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-brand-dark text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={hejTalentLogo} alt="Hej Talent" className="h-8 mb-4 filter brightness-0 invert" />
              <p className="text-sm opacity-80">
                Remote Backoffice-Fachkräfte für deutsche Unternehmen
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Lösungen</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>Buchhaltung Remote</div>
                <div>Kundenservice</div>
                <div>Administrative Unterstützung</div>
                <div>Dateneingabe</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>Über uns</div>
                <div>Karriere</div>
                <div>Partner werden</div>
                <div>Kontakt</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
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
            <p>&copy; 2024 Hej Talent. Alle Rechte vorbehalten.</p>
            <div className="flex justify-center gap-6 mt-2">
              <span className="hover:opacity-100 transition-opacity duration-300">Datenschutz</span>
              <span className="hover:opacity-100 transition-opacity duration-300">Impressum</span>
              <span className="hover:opacity-100 transition-opacity duration-300">AGB</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onVideoUnlock={handleVideoUnlock}
      />
    </div>
  );
};

export default BackofficeLanding;