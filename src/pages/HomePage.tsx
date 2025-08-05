import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Code, Shield, Star, CheckCircle, Mail, Phone, Linkedin, MapPin } from "lucide-react";
import heyTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(0);
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

  const services = [
    {
      title: "KI-Entwickler Vermittlung",
      description: "Qualifizierte AI-Entwickler aus Deutschland und Europa für Ihre Projekte",
      features: ["Umfassende Prüfung", "Direkte Vermittlung", "Projektbasiert oder Festanstellung"]
    },
    {
      title: "Team-Building",
      description: "Komplette Entwicklerteams für größere KI-Projekte",
      features: ["Skalierbare Teams", "Verschiedene Expertisen", "Agile Methoden"]
    },
    {
      title: "Consulting",
      description: "Beratung für KI-Strategien und Technologie-Entscheidungen",
      features: ["Strategieberatung", "Technologie-Evaluation", "Implementation Support"]
    }
  ];

  const stats = [
    { label: "Geprüfte Entwickler", value: "500+" },
    { label: "Erfolgreiche Projekte", value: "150+" },
    { label: "Zufriedene Kunden", value: "98%" },
    { label: "Durchschnittliche Projektdauer", value: "6 Monate" }
  ];

  const testimonials = [
    {
      name: "Dr. Marcus Weber",
      company: "TechCorp GmbH",
      text: "HejTalent hat uns dabei geholfen, unser KI-Team innerhalb von 4 Wochen zu vervollständigen. Die Qualität der Entwickler ist ausgezeichnet.",
      rating: 5
    },
    {
      name: "Sarah Mueller",
      company: "InnovateAI",
      text: "Professionelle Abwicklung und top qualifizierte Kandidaten. Wir haben bereits mehrere Projekte erfolgreich umgesetzt.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center animate-slide-in-left">
              <img src={heyTalentLogo} alt="HeyTalent" className="h-8 md:h-10 hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#solutions" className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Lösungen</a>
              <a href="#working-method" className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">So arbeiten wir</a>
              <a href="#use-cases" className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Use Cases</a>
              <a href="#about" className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Über uns</a>
              <a href="#contact" className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Kontakt</a>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild className="hidden md:inline-flex">
                <a href="/auth">Login</a>
              </Button>
              <Button className="bg-primary hover:bg-primary-hover">
                Kostenloses Strategiegespräch
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight animate-fade-in">
              Ihr Engpass. Unsere Lösung.
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-delay-1">
              Remote-Teams, die genau dort ansetzen, wo Sie sie brauchen.
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in-delay-2">
              Wählen Sie Ihr Thema und finden Sie Experten aus Backoffice, IT oder KI, 
              die Ihre Herausforderung präzise und schnell lösen.
            </p>
            
            {/* Segment Tiles */}
            <div className="grid md:grid-cols-3 gap-6 mb-12 animate-slide-up-delay-3">
              <Card 
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 hover:border-primary"
                onClick={() => navigate('/solutions/backoffice')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    Operative Rückendeckung im Tagesgeschäft
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                    Prozessoptimierung, Automation und virtuelle Assistenz für mehr Effizienz
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 hover:border-primary"
                onClick={() => navigate('/solutions/it-development')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    Skalierbare Entwicklung, wenn Ihr IT-Team am Limit ist
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                    Full-Stack Development, DevOps und Architektur-Expertise
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 hover:border-primary"
                onClick={() => navigate('/solutions/ai-ml')}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    KI-Projekte, die wirklich liefern
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                    MLOps, Datenstrategie und produktive KI-Implementierungen
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-4">
              <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
                Kostenloses Strategiegespräch buchen
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Lösungen entdecken
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-subtle overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2 group-hover:animate-bounce">{stat.value}</div>
                <div className="text-brand-dark/70 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Unsere Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-delay-1">
              Maßgeschneiderte Lösungen für Ihre KI-Projekte und Entwicklerbedarfe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                ref={(el) => {cardRefs.current[index] = el;}}
                className={`cursor-pointer transition-all duration-500 hover:shadow-xl hover:scale-105 group border-2 hover:border-primary ${
                  activeService === index ? 'ring-2 ring-primary border-primary' : ''
                } ${
                  visibleCards[index] 
                    ? 'animate-scale-in opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 0.2}s` }}
                onClick={() => setActiveService(index)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    {service.title}
                  </CardTitle>
                  <CardDescription className="group-hover:text-brand-dark transition-colors duration-300">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-sm text-brand-dark/80 group-hover:text-brand-dark transition-colors duration-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-subtle px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark">Über HejTalent</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Seit 2020 sind wir der vertrauensvolle Partner für Unternehmen, die auf der Suche nach 
                erstklassigen KI-Entwicklern sind. Unser Fokus liegt auf der gründlichen Prüfung und 
                Vermittlung von Talenten aus Deutschland und Europa.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-brand-dark font-medium">Umfassende Background-Checks</span>
                </div>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-brand-dark font-medium">Persönliche Betreuung</span>
                </div>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-brand-dark font-medium">Qualitätsgarantie</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-in-right">
              <div className="aspect-square bg-gradient-primary rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <Code className="w-24 h-24 text-white animate-float" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Was unsere Kunden sagen</h2>
            <p className="text-xl text-muted-foreground animate-fade-in-delay-1">
              Vertrauen Sie auf die Erfahrungen unserer zufriedenen Kunden
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-500 animate-slide-up group hover:scale-105" style={{ transitionDelay: `${index * 0.2}s` }}>
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 hover:scale-110 transition-transform duration-200" style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic group-hover:text-brand-dark transition-colors duration-300">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-brand-dark group-hover:text-primary transition-colors duration-300">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-subtle px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Kontakt aufnehmen</h2>
            <p className="text-xl text-muted-foreground animate-fade-in-delay-1">
              Lassen Sie uns gemeinsam Ihr KI-Projekt verwirklichen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6 animate-slide-in-left">
              <h3 className="text-2xl font-semibold text-brand-dark">Sprechen Sie uns an</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <a href="mailto:kontakt@hejcompany.de" className="hover:text-primary transition-colors text-brand-dark font-medium">
                    kontakt@hejcompany.de
                  </a>
                </div>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <a href="tel:+4989901762180" className="hover:text-primary transition-colors text-brand-dark font-medium">
                    +49 89 9017 6218
                  </a>
                </div>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <Linkedin className="w-4 h-4 text-white" />
                  </div>
                  <a href="https://www.linkedin.com/company/hejtalent/?originalSubdomain=de" 
                     target="_blank" rel="noopener noreferrer" 
                     className="hover:text-primary transition-colors text-brand-dark font-medium">
                    LinkedIn Profil
                  </a>
                </div>
                <div className="flex items-center gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center group-hover:animate-bounce">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-brand-dark font-medium">München, Deutschland</span>
                </div>
              </div>
            </div>

            <Card className="p-6 hover:shadow-xl transition-all duration-500 animate-slide-in-right hover:scale-105">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-brand-dark">Kostenlose Beratung anfragen</CardTitle>
                <CardDescription>
                  Erzählen Sie uns von Ihrem Projekt und wir melden uns binnen 24 Stunden
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Button className="w-full bg-primary hover:bg-primary-hover animate-pulse-glow" size="lg">
                  Jetzt Beratung anfragen
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4">HejTalent</h3>
              <p className="text-gray-300 text-sm">
                Ihr Partner für geprüfte KI-Entwickler aus Deutschland und Europa.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://hejtalent.de/imprint-de/" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Impressum</a></li>
                <li><a href="https://hejtalent.de/privacy-policy-de/" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Datenschutz</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="mailto:kontakt@hejcompany.de" className="hover:text-white transition-colors">
                    kontakt@hejcompany.de
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
            © 2025 HejTalent. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;