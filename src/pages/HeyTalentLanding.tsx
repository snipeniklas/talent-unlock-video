import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VideoModal } from '@/components/VideoModal';
import { Play, Star, CheckCircle, Users, Clock, Shield, Calendar, Linkedin } from 'lucide-react';
import videoThumbnail from '@/assets/video-thumbnail.jpg';
import customerLogos from '@/assets/customer-logos.png';
import verifiedBadge from '@/assets/verified-badge.png';

const HeyTalentLanding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoUnlocked, setIsVideoUnlocked] = useState(false);

  const handleVideoUnlock = () => {
    setIsVideoUnlocked(true);
  };

  const handleCTAClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Sticky Trust Bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-4">
              <img src={customerLogos} alt="Kundenstimmen" className="h-8 opacity-60" />
            </div>
            <div className="flex items-center gap-2 bg-gradient-primary text-white px-4 py-2 rounded-full">
              <img src={verifiedBadge} alt="Verified" className="w-5 h-5" />
              <span className="text-sm font-semibold">Geprüfte Entwickler</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Wie Sie in 7 Tagen geprüfte KI-Entwickler{' '}
              <span className="text-primary">30% günstiger</span> bekommen
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Exklusives Video zeigt Ihnen den bewährten 3-Schritte-Prozess für hochqualifizierte Entwickler 
              aus unserem Netzwerk – ohne Risiko und mit Geld-zurück-Garantie.
            </p>

            {/* Video Thumbnail/Player */}
            <div className="relative mb-12 animate-slide-up">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
                {!isVideoUnlocked ? (
                  <>
                    <div className="relative">
                      <img 
                        src={videoThumbnail} 
                        alt="Video Thumbnail" 
                        className="w-full h-auto filter blur-sm opacity-80"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-white bg-opacity-90 rounded-full flex items-center justify-center mb-4 mx-auto shadow-xl hover:bg-opacity-100 transition-all duration-300">
                            <Play className="w-12 h-12 text-primary ml-1" />
                          </div>
                          <p className="text-white text-lg font-semibold">
                            Video ansehen & Methode erfahren
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-black flex items-center justify-center">
                    <iframe
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1"
                      title="HeyTalent Video"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
              className="mb-16 animate-scale-in"
              disabled={isVideoUnlocked}
            >
              {isVideoUnlocked ? 'Video bereits freigeschaltet' : 'Video jetzt freischalten'}
            </Button>

            {/* 3-Bullet Preview */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in">
              <Card className="border-2 hover:border-primary transition-colors duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">30-50% Kostenersparnis</h3>
                  <p className="text-muted-foreground">
                    Sparen Sie bis zu €4.000 pro Monat bei gleicher Qualität durch unser direktes Netzwerk
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">48h Matching-Prozess</h3>
                  <p className="text-muted-foreground">
                    Von der Anfrage zum perfekten Entwickler in nur 2 Tagen – Start bereits nach 7 Tagen
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">100% Geld-zurück-Garantie</h3>
                  <p className="text-muted-foreground">
                    Nicht zufrieden? Volle Rückerstattung in den ersten 14 Tagen – ohne Fragen
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stack */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark mb-12">
              Über 50 Unternehmen vertrauen bereits auf HeyTalent
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-3">
                      "Binnen 5 Tagen hatte ich den perfekten KI-Entwickler. Spart uns monatlich €3.200 bei besserer Qualität."
                    </p>
                    <div className="text-sm font-semibold">Marcus Weber, CTO TechStart GmbH</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-3">
                      "Deutschsprachige Kommunikation und Top-Skills. Unser MVP war in 3 Wochen fertig – unfassbar!"
                    </p>
                    <div className="text-sm font-semibold">Sarah Müller, Gründerin InnovateLab</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-center gap-4 text-primary">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-lg">4,9 / 5</span>
              <span className="text-muted-foreground">aus 57 Bewertungen</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-brand-dark mb-12">
              Häufig gestellte Fragen
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="quality" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Wie stellen Sie die Qualität der Entwickler sicher?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Jeder Entwickler durchläuft einen 3-stufigen Prüfprozess: Technische Skills-Tests, 
                  Live-Coding-Session und Referenzcheck. Nur 8% aller Bewerber bestehen unsere Standards.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Wie wird der Datenschutz gewährleistet?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  DSGVO-konform, deutsche Server und NDAs mit allen Entwicklern. 
                  Ihre Projektdaten bleiben zu 100% vertraulich und sicher.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="communication" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Sprechen die Entwickler fließend Deutsch?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Ja, alle unsere Entwickler haben mindestens B2-Niveau in Deutsch und arbeiten 
                  in deutschen Zeitzonen. Kommunikation läuft reibungslos auf Deutsch.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="contract" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  Welche Vertragsmodelle bieten Sie an?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pt-2">
                  Flexibel nach Ihren Bedürfnissen: Vollzeit, Teilzeit oder projektbasiert. 
                  Monatliche Kündigung möglich, keine langfristigen Bindungen.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Secondary CTA - Only visible after video unlock */}
      {isVideoUnlocked && (
        <section className="py-16 bg-gradient-primary">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center text-white animate-fade-in">
              <h2 className="text-3xl font-bold mb-4">
                Bereit für Ihren KI-Entwickler?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Buchen Sie jetzt Ihr 15-minütiges Beratungsgespräch und erfahren Sie, 
                wie wir Ihnen helfen können.
              </p>
              <Button
                variant="secondary"
                size="xl"
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => window.open('https://calendly.com/heytalent', '_blank')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Beratungsgespräch buchen
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-brand-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-xl mb-4">HeyTalent</h3>
                <p className="text-gray-300 text-sm">
                  Ihr Partner für geprüfte KI-Entwickler aus Deutschland und Europa.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Rechtliches</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/impressum" className="text-gray-300 hover:text-white transition-colors">Impressum</a></li>
                  <li><a href="/datenschutz" className="text-gray-300 hover:text-white transition-colors">Datenschutz</a></li>
                  <li><a href="/agb" className="text-gray-300 hover:text-white transition-colors">AGB</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Kontakt</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>kontakt@heytalent.de</li>
                  <li>+49 (0) 30 12345678</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Social Media</h4>
                <a href="https://linkedin.com/company/heytalent" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-300 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
              © 2024 HeyTalent. Alle Rechte vorbehalten.
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

export default HeyTalentLanding;