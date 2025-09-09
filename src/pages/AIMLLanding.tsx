import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Play, Star, CheckCircle, Users, Clock, Shield, Calendar, Linkedin, Brain, Sparkles, Target } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import customerLogos from '@/assets/customer-logos.png';
import verifiedBadge from '@/assets/verified-badge.png';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

const AIMLLanding = () => {
  
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
            KI-Experten ab 3 Monaten <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            40-60% günstiger <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Bewährte KI-Lösungen <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Von Konzept bis Deployment <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            ML, Deep Learning, NLP <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Keine Headhunter-Fee <span className="text-primary text-lg">•</span>
          </span>
          
          {/* Second set for seamless loop */}
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            KI-Experten ab 3 Monaten <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            40-60% günstiger <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Bewährte KI-Lösungen <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Von Konzept bis Deployment <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            ML, Deep Learning, NLP <span className="text-primary text-lg">•</span>
          </span>
          <span className="flex items-center gap-3 text-sm font-medium text-brand-dark">
            Keine Headhunter-Fee <span className="text-primary text-lg">•</span>
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight animate-fade-in">
              <span className="text-primary">RaaS</span> - KI & ML Experten{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary-hover bg-clip-text animate-shimmer bg-shimmer bg-200% animate-bounce-in-delay-1">
                40-60% günstiger
              </span> für Ihre KI-Transformation
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto animate-fade-in-delay-1">
              <strong>Resources as a Service</strong> – Unser bewährtes RaaS-System macht es einfach: 
              Sie beschreiben Ihr KI-Problem, wir liefern die perfekte Experten-Lösung.
            </p>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in-delay-1">
              Von der KI-Strategie bis zur produktiven Lösung: Holen Sie sich spezialisierte Data Scientists, 
              ML Engineers und KI-Entwickler aus unserem geprüften Expertenpool – remote und sofort einsatzbereit.
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
                            KI-Transformation entdecken
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-black flex items-center justify-center animate-scale-in">
                    <iframe
                      src="https://drive.google.com/file/d/1YPJcKaFDr4BNvHxAOKd3obYIpWVuljbH/preview"
                      title="KI ML Experten Video"
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
              asChild
              className="mb-16 animate-bounce-in-delay-3 hover:animate-pulse relative overflow-hidden"
            >
              <Link to="/app/search-requests/new">
                <span className="relative z-10">
                  RaaS Anfrage stellen
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
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">KI-Spezialisten</h3>
                  <p className="text-muted-foreground">
                    Data Scientists, ML Engineers und KI-Entwickler mit PhD/Master und 5+ Jahren Praxiserfahrung
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
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">Bewährte KI-Lösungen</h3>
                  <p className="text-muted-foreground">
                    Von Computer Vision bis NLP – praxiserprobte Lösungen für Ihr Geschäftsmodell
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
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300">ROI-Fokus</h3>
                  <p className="text-muted-foreground">
                    Messbare Geschäftsergebnisse in 3-6 Monaten statt jahrelanger Forschung
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
              Warum scheitern die meisten KI-Projekte?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="text-red-500 mb-4">
                  <Brain className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="font-bold mb-3">Fehlendes KI-Know-how</h3>
                <p className="text-muted-foreground text-sm">
                  Interne Teams haben keine Erfahrung mit ML-Projekten und überschätzen die Komplexität
                </p>
              </Card>

              <Card className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="text-red-500 mb-4">
                  <Clock className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="font-bold mb-3">Monatelange Suche</h3>
                <p className="text-muted-foreground text-sm">
                  Qualifizierte Data Scientists sind rar und überteuert – wenn überhaupt verfügbar
                </p>
              </Card>

              <Card className="p-6 border-red-200 hover:shadow-lg transition-all duration-300">
                <div className="text-red-500 mb-4">
                  <Target className="w-8 h-8 mx-auto" />
                </div>
                <h3 className="font-bold mb-3">Kein Business-Fokus</h3>
                <p className="text-muted-foreground text-sm">
                  Projekte versanden in endloser Forschung ohne messbare Geschäftsergebnisse
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
              So funktioniert's: Ihr KI-Experte in 3 einfachen Schritten
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">KI-Projekt über unsere Platform definieren</h3>
                  <p className="text-muted-foreground mb-4">
                    Loggen Sie sich in unser System ein und beschreiben Sie Ihr KI-Use-Case. 
                    Definieren Sie Geschäftsziele, Datenquellen, gewünschte KI-Technologien 
                    und Projektumfang über unsere spezialisierte Eingabemaske.
                  </p>
                  <div className="bg-white p-4 rounded-lg border">
                    <strong className="text-sm">Platform-Features:</strong> KI-Use-Case-Templates, ROI-Calculator, 
                    Datenquellen-Assessment, Technologie-Wizard, Projektphasen-Planer
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">KI-Experten-Matching & Strategie-Review</h3>
                  <p className="text-muted-foreground mb-4">
                    Unser System matched automatisch passende KI-Spezialisten basierend auf Ihrem Use-Case. 
                    Sie erhalten binnen 48h eine kuratierte Auswahl von 2-3 Experten plus eine erste 
                    Machbarkeitsbewertung direkt in der Platform.
                  </p>
                  <div className="bg-white p-4 rounded-lg border">
                    <strong className="text-sm">Sie erhalten:</strong> Experten-Profile mit KI-Spezialisierung, 
                    ähnliche Projekt-Referenzen, Machbarkeitsstudie, Zeitplan und erste Lösungsansätze
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3">Strategy Call & Projekt-Start</h3>
                  <p className="text-muted-foreground mb-4">
                    30-minütiger Strategy Call mit Ihrem ausgewählten KI-Experten zur finalen Abstimmung. 
                    Danach übernehmen wir Verträge, Projekt-Setup und Kick-off. Start der ersten 
                    Projektphase binnen 1-2 Wochen.
                  </p>
                  <div className="bg-white p-4 rounded-lg border">
                    <strong className="text-sm">Platform-Support:</strong> Strategy-Call-Templates, 
                    automatische Verträge, Projekt-Dashboards, Milestone-Tracking und 24/7 Support
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
              Führende Unternehmen vertrauen unseren KI-Experten
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
                      "Unser KI-Chatbot verarbeitet jetzt 80% der Kundenanfragen automatisch. ROI nach 4 Monaten erreicht."
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">Dr. Stefan Meyer, CEO InnovateTech</div>
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
                      "Computer Vision für Qualitätskontrolle – 98% Genauigkeit, 50% weniger Ausschuss. Fantastisches Team!"
                    </p>
                    <div className="text-sm font-semibold group-hover:text-primary transition-colors duration-300">Maria Hoffmann, CTO ManufacturingPro</div>
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
              <span className="text-muted-foreground hover:text-foreground transition-colors duration-300">aus 28 KI-Projekten</span>
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
              <AccordionItem value="expertise" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-1 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Welche KI-Bereiche decken Ihre Experten ab?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Machine Learning, Deep Learning, Computer Vision, NLP, Predictive Analytics, 
                  Recommendation Systems, Chatbots, Automatisierung und Custom AI Solutions.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="qualifications" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-2 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Welche Qualifikationen haben Ihre KI-Experten?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  PhD/Master in Data Science, KI oder verwandten Bereichen. 5+ Jahre Praxiserfahrung, 
                  Expertise in Python, TensorFlow, PyTorch. Viele kommen aus Tech-Konzernen oder Research.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="projects" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-3 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Welche Art von KI-Projekten wurden bereits umgesetzt?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Chatbots für E-Commerce, Predictive Maintenance, Dokumentenanalyse, Computer Vision für 
                  Qualitätskontrolle, Fraud Detection, Personalisierung, Sprachassistenten und mehr.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timeline" className="border rounded-lg px-6 hover:border-primary hover:shadow-lg transition-all duration-300 animate-slide-up-delay-4 group">
                <AccordionTrigger className="text-left group-hover:text-primary transition-colors duration-300">
                  Wie lange dauert ein typisches KI-Projekt?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Proof of Concept: 4-8 Wochen. MVP: 3-6 Monate. Produktive Lösung: 6-12 Monate. 
                  Wir arbeiten agil mit regelmäßigen Deliveries und Feedback-Schleifen.
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
              Bereit für Ihre KI-Transformation?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 animate-fade-in-delay-1">
              Lassen Sie uns in einem 30-minütigen Strategy Call Ihr KI-Potenzial identifizieren 
              und den perfekten Experten für Ihr Projekt finden.
            </p>
            <Button variant="secondary" size="xl" className="animate-scale-in-delay-2 hover:scale-110 transition-transform duration-300">
              KI-Strategy Call buchen
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
                KI & ML Experten für deutsche Unternehmen
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">KI-Bereiche</h4>
              <div className="space-y-2 text-sm opacity-80">
                <div>Machine Learning</div>
                <div>Computer Vision</div>
                <div>Natural Language Processing</div>
                <div>Predictive Analytics</div>
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

    </div>
  );
};

export default AIMLLanding;