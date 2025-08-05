import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Code, Shield, Star, CheckCircle, Mail, Phone, Linkedin, MapPin, Zap, Target, TrendingUp } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import InteractiveAppScreen from "@/components/InteractiveAppScreen";

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
      title: "Remote Backoffice-Kräfte",
      description: "Qualifizierte Remote-Mitarbeiter für administrative Aufgaben und operative Unterstützung",
      features: ["Büroorganisation & Administration", "Buchhaltung & Controlling", "Kundenservice & Support"]
    },
    {
      title: "Remote IT-Entwickler",
      description: "Erfahrene Remote-Entwickler für alle Bereiche der Softwareentwicklung",
      features: ["Full-Stack Entwicklung", "DevOps & Cloud", "Mobile & Web Apps"]
    },
    {
      title: "Remote KI-Spezialisten",
      description: "KI-Experten und Data Scientists für Machine Learning und AI-Projekte",
      features: ["Machine Learning", "Data Science", "KI-Strategieberatung"]
    }
  ];

  const stats = [
    { label: "Vermittelte Remote-Fachkräfte", value: "500+" },
    { label: "Erfolgreiche Vermittlungen", value: "150+" },
    { label: "Zufriedene Unternehmen", value: "98%" },
    { label: "Durchschnittliche Besetzungszeit", value: "2" }
  ];

  const testimonials = [
    {
      name: "Dr. Marcus Weber",
      company: "TechCorp GmbH",
      text: "HeyTalent hat uns innerhalb von 2 Wochen die perfekte Remote-Buchhalterin vermittelt. Professionell und zuverlässig.",
      rating: 5
    },
    {
      name: "Sarah Mueller",
      company: "StartupTech GmbH",
      text: "Unser Remote-Entwicklungsteam von HeyTalent arbeitet seit 6 Monaten perfekt mit uns zusammen. Top Qualität!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 mb-8 shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-brand-dark">Über 500+ erfolgreiche Vermittlungen</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-brand-dark mb-8 leading-tight animate-fade-in">
              Ihr Engpass. Unsere Lösung.
            </h1>
            <p className="text-2xl lg:text-3xl text-muted-foreground mb-6 max-w-4xl mx-auto animate-fade-in-delay-1 font-light">
              Qualifizierte Remote-Fachkräfte, die genau dort ansetzen, wo Sie sie brauchen.
            </p>
            <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto animate-fade-in-delay-2">
              Wählen Sie Ihr Thema und finden Sie Remote-Experten aus Backoffice, IT oder KI, 
              die Ihre Herausforderung präzise und schnell lösen.
            </p>
            
            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-slide-up-delay-3">
              <Button asChild size="lg" className="text-xl px-12 py-6 bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 border-0">
                <Link to="/app/search-requests/new">
                  <Phone className="w-6 h-6 mr-3" />
                  Suchauftrag kostenlos erstellen
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-xl px-12 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Remote-Fachkräfte entdecken
              </Button>
            </div>
            
            {/* Solution Cards */}
            <div className="grid md:grid-cols-3 gap-8 animate-slide-up-delay-4">
              <Card 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden relative"
                onClick={() => navigate('/solutions/backoffice')}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                    Remote Backoffice-Fachkräfte
                  </CardTitle>
                  <p className="text-muted-foreground group-hover:text-brand-dark transition-colors text-lg">
                    Qualifizierte Remote-Mitarbeiter für Administration, Buchhaltung und operative Unterstützung
                  </p>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <Button className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-300 border-0">
                    Jetzt starten <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden relative"
                onClick={() => navigate('/solutions/it-development')}
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce shadow-lg">
                    <Code className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                    Remote IT-Entwickler & Tech-Experten
                  </CardTitle>
                  <p className="text-muted-foreground group-hover:text-brand-dark transition-colors text-lg">
                    Erfahrene Remote-Entwickler für Full-Stack, DevOps und Softwarearchitektur
                  </p>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <Button className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-300 border-0">
                    Jetzt starten <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden relative"
                onClick={() => navigate('/solutions/ai-ml')}
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                    Remote KI & ML-Spezialisten
                  </CardTitle>
                  <p className="text-muted-foreground group-hover:text-brand-dark transition-colors text-lg">
                    KI-Experten und Data Scientists für Machine Learning und AI-Projekte
                  </p>
                </CardHeader>
                <CardContent className="pt-0 relative z-10">
                  <Button className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-300 border-0">
                    Jetzt starten <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-subtle overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-brand-dark mb-4">Vertrauen Sie auf unsere Expertise</h2>
              <p className="text-xl text-muted-foreground">Zahlen, die für sich sprechen</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-110 transition-all duration-500 bg-white/50 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/80 hover:shadow-xl">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-3 group-hover:animate-bounce">{stat.value}</div>
                  <div className="text-brand-dark font-semibold text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* CTA in Stats Section */}
            <div className="text-center mt-16">
              <Button size="lg" className="text-xl px-12 py-6 bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 border-0">
                <Target className="w-6 h-6 mr-3" />
                Werden Sie Teil dieser Erfolgsgeschichte
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Unsere Remote-Fachkräfte</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-delay-1">
              Maßgeschneiderte Remote-Teams für Ihre spezifischen Anforderungen
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

      {/* Interactive App Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
              Erleben Sie die HeyTalent Plattform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Entdecken Sie unsere intuitive Plattform und sehen Sie, wie einfach es ist, 
              die perfekten Remote-Fachkräfte für Ihr Unternehmen zu finden.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Customer Dashboard */}
            <InteractiveAppScreen
              title="Kunden-Dashboard"
              description="Verwalten Sie Ihre Suchaufträge und verfolgen Sie den Fortschritt Ihrer Projekte"
              screen="dashboard"
            />

            {/* Search Requests Management */}
            <InteractiveAppScreen
              title="Suchaufträge verwalten"
              description="Erstellen und verwalten Sie Ihre Anfragen für Remote-Fachkräfte"
              screen="search-requests"
            />
          </div>

          <div className="grid lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
            {/* Resource Overview */}
            <InteractiveAppScreen
              title="Ressourcen-Übersicht"
              description="Entdecken Sie von HeyTalent bereitgestellte Remote-Ressourcen für Ihre Projekte"
              screen="resources"
            />
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-subtle rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-4 text-brand-dark">
                Bereit, Ihre Remote-Fachkräfte zu finden?
              </h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Starten Sie noch heute und erleben Sie, wie schnell und effizient 
                Sie die besten Remote-Talente für Ihr Unternehmen finden können.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-gradient-primary hover:shadow-lg border-0">
                  <Link to="/app/search-requests/new">
                    Kostenlos testen
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/resource-hub">
                    Zur Plattform
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Working Method Section */}
      <section id="working-method" className="py-20 bg-gradient-subtle px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-in-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark">Über HeyTalent</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Seit 2020 sind wir der vertrauensvolle Partner für Unternehmen, die auf der Suche nach 
                erstklassigen Remote-Fachkräften sind. Unser Fokus liegt auf der gründlichen Prüfung und 
                Vermittlung von Remote-Talenten aus Deutschland und Europa.
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
              Lassen Sie uns gemeinsam die passenden Remote-Fachkräfte für Ihr Unternehmen finden
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
                <CardTitle className="text-brand-dark">Suchauftrag kostenlos erstellen</CardTitle>
                <CardDescription>
                  Erzählen Sie uns von Ihrem Projekt und wir melden uns binnen 24 Stunden
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Button asChild className="w-full bg-primary hover:bg-primary-hover animate-pulse-glow" size="lg">
                  <Link to="/app/search-requests/new">
                    Suchauftrag kostenlos erstellen
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ContactCTA />
      <PublicFooter />
    </div>
  );
};

export default HomePage;