import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Code, Shield, Star, CheckCircle, Mail, Phone, Linkedin, MapPin, Zap, Target, TrendingUp, Search } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import InteractiveAppScreen from "@/components/InteractiveAppScreen";
import FloatingAppDemo from "@/components/FloatingAppDemo";
import ProjectTimeline from "@/components/ProjectTimeline";

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
    { label: "Wochen Besetzungszeit", value: "2-4" }
  ];

  const testimonials = [
    {
      name: "Dr. Marcus Weber",
      company: "TechCorp GmbH",
      text: "Hej Talent hat uns innerhalb von 2 Wochen die perfekte Remote-Buchhalterin vermittelt. Professionell und zuverlässig.",
      rating: 5
    },
    {
      name: "Sarah Mueller",
      company: "StartupTech GmbH",
      text: "Unser Remote-Entwicklungsteam von Hej Talent arbeitet seit 6 Monaten perfekt mit uns zusammen. Top Qualität!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative py-8 md:py-12 lg:py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column - Content */}
              <div className="space-y-6 lg:space-y-8">
                {/* Expert Status Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-3">
                  <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 md:px-4 py-2 shadow-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-medium text-brand-dark">9+ Jahre Remote-Expertise</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 md:px-4 py-2 shadow-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-medium text-brand-dark">500+ geprüfte Fachkräfte</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 md:px-4 py-2 shadow-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-medium text-brand-dark">98% Erfolgsquote</span>
                  </div>
                </div>

                {/* Main Title */}
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-dark mb-4 lg:mb-6 leading-tight animate-fade-in">
                    <span className="text-primary">RaaS</span> - Resources as a Service
                  </h1>
                  <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-4 lg:mb-6 animate-fade-in-delay-1 font-light">
                    <span className="font-semibold text-brand-dark">Die Remote-Experten,</span> die Ihre Herausforderungen verstehen und lösen.
                  </p>
                  <p className="text-base md:text-lg text-muted-foreground mb-6 lg:mb-8 animate-fade-in-delay-2">
                    Als <span className="font-semibold text-primary">Marktführer für Remote-Recruiting</span> verbinden wir Sie seit 9 Jahren mit den besten Talenten. 
                    Unser bewährtes RaaS-System macht es einfach: Sie beschreiben Ihr Problem, wir finden die perfekte Lösung.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4 justify-center lg:justify-start animate-slide-up-delay-3">
                  <Button asChild size="lg" className="w-full sm:w-auto text-base md:text-lg px-8 md:px-10 py-5 md:py-6 bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 relative">
                    <Link to="/app/search-requests/new">
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        KOSTENFREI
                      </span>
                      <Phone className="w-5 h-5 mr-3" />
                      <span>Unverbindliche RaaS Anfrage starten</span>
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Link>
                  </Button>
                  
                  <div className="flex justify-center lg:justify-start">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-sm text-primary hover:bg-primary/10 px-4 py-2"
                      onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Oder entdecken Sie unsere Expertise →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column - Video & CTA Box */}
              <div className="space-y-6 lg:space-y-8">
                {/* Video */}
                <div className="relative">
                  <div className="aspect-video rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-primary/20">
                    <iframe 
                      src="https://hejcompanyde-my.sharepoint.com/personal/joachim_kalff_hejcompany_de/_layouts/15/embed.aspx?UniqueId=7cd68a6d-417a-4027-8508-b394d09d7132&embed=%7B%22hvm%22%3Atrue%2C%22ust%22%3Atrue%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" 
                      className="w-full h-full border-0"
                      scrolling="no" 
                      allowFullScreen 
                      title="Hej Talent Intro Video"
                    />
                  </div>
                  {/* Video accent border */}
                  <div className="absolute -inset-1 bg-gradient-primary rounded-2xl lg:rounded-3xl opacity-50 -z-10"></div>
                </div>
                
                {/* Risk-Free Highlight */}
                <div className="bg-gradient-primary/10 border border-primary/20 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <p className="text-base md:text-lg font-semibold text-brand-dark mb-2">
                    ✅ 100% kostenfrei & unverbindlich starten
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Erhalten Sie maßgeschneiderte Ressourcen-Vorschläge ohne jegliche Verpflichtung. 
                    Erst bei Ihrer Zustimmung beginnt die Zusammenarbeit.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Trust Indicators */}
            <div className="text-center mt-12 lg:mt-16">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">Vertrauen Sie auf 9+ Jahre Expertise:</p>
              <div className="flex flex-wrap justify-center gap-2 md:gap-8 items-center opacity-60">
                <span className="text-xs md:text-sm font-medium">Internationale Kunden</span>
                <span className="text-xs md:text-sm font-medium hidden md:inline">•</span>
                <span className="text-xs md:text-sm font-medium">DSGVO-konform</span>
                <span className="text-xs md:text-sm font-medium hidden md:inline">•</span>
                <span className="text-xs md:text-sm font-medium">ISO 27001</span>
              </div>
            </div>
            
            {/* Solution Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 lg:mt-16 animate-slide-up-delay-4">
              <Card 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden relative h-full flex flex-col"
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
                <CardContent className="pt-0 relative z-10 mt-auto">
                  <Button className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-300 border-0">
                    Jetzt starten <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden relative h-full flex flex-col"
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
                <CardContent className="pt-0 relative z-10 mt-auto">
                  <Button className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-300 border-0">
                    Jetzt starten <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-0 bg-white/80 backdrop-blur-sm hover:bg-white overflow-hidden relative h-full flex flex-col"
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
                <CardContent className="pt-0 relative z-10 mt-auto">
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
      <section className="py-12 md:py-20 bg-gradient-subtle overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-brand-dark mb-4">
                <span className="text-primary">Marktführer</span> für Remote-Recruiting seit 2020
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8">Zahlen, die unsere Expertise beweisen</p>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 max-w-4xl mx-auto border border-primary/10">
                <p className="text-base md:text-lg font-semibold text-brand-dark mb-2">
                  🏆 Ausgezeichnet als "Best Remote Recruiting Platform 2023"
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  Über 150 Unternehmen vertrauen bereits auf unsere bewährte RaaS-Methodik. 
                  Von Startups bis DAX-Konzerne - wir finden die passenden Remote-Experten.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-110 transition-all duration-500 bg-white/50 backdrop-blur-sm rounded-2xl p-4 md:p-8 hover:bg-white/80 hover:shadow-xl">
                  <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3 group-hover:animate-bounce">{stat.value}</div>
                  <div className="text-brand-dark font-semibold text-sm md:text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* CTA in Stats Section */}
            <div className="text-center mt-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-primary/20 shadow-xl">
                <p className="text-lg font-semibold text-brand-dark mb-4">
                  Ihre kostenfreie RaaS Anfrage dauert nur 3 Minuten
                </p>
                <p className="text-muted-foreground mb-6">
                  Beschreiben Sie Ihre Herausforderung, wir schlagen Ihnen passende Experten vor. 
                  Kein Risiko, keine versteckten Kosten.
                </p>
                <Button asChild size="lg" className="text-xl px-12 py-6 bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 border-0">
                  <Link to="/app/search-requests/new">
                    <Target className="w-6 h-6 mr-3" />
                    Jetzt kostenfrei starten
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Unsere internationalen Fachkräfte</h2>
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

      {/* Interactive Platform Experience Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
              Erleben Sie unseren <span className="text-primary">RaaS</span> Hub
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Entdecken Sie, wie unser intuitiver Hub Ihren gesamten RaaS-Prozess vereinfacht - 
              von der Anfrage bis zur erfolgreichen Zusammenarbeit.
            </p>
          </div>

          {/* Platform Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 group border border-gray-200">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">RaaS Anfrage erstellen</h3>
              <p className="text-muted-foreground mb-4">
                Definieren Sie Ihre Anforderungen in nur wenigen Klicks. Unser intelligentes System 
                erfasst automatisch alle relevanten Details für Ihre RaaS-Lösung.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Skill-basierte Auswahl
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Budget & Zeitrahmen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Projektspezifikation
                </li>
              </ul>
            </div>

            <div className="bg-gradient-subtle p-8 rounded-2xl hover:shadow-xl transition-all duration-300 group border border-primary/20">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Ressourcen-Matching</h3>
              <p className="text-muted-foreground mb-4">
                KI-gestütztes Matching verbindet Sie mit den passenden Remote-Experten aus unserem 
                vorqualifizierten Pool von über 500+ Fachkräften.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Automatisches Matching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Profil-Bewertungen
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Verfügbarkeits-Check
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl hover:shadow-xl transition-all duration-300 group border-2 border-gray-200 hover:border-primary">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">Projekt-Management</h3>
              <p className="text-muted-foreground mb-4">
                Verfolgen Sie Ihre RaaS-Projekte in Echtzeit. Von der Auswahl bis zur erfolgreichen 
                Umsetzung behalten Sie jederzeit den Überblick.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Live-Dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Fortschritt-Tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Kommunikations-Hub
                </li>
              </ul>
            </div>
          </div>

          {/* Floating App Demo */}
          <FloatingAppDemo
            title="Erleben Sie RaaS in Aktion"
            description="Sehen Sie, wie unser intelligentes System Ihre Ressourcen-Anfragen in Echtzeit bearbeitet und die perfekten Remote-Experten für Sie findet."
          />

          {/* Project Timeline */}
          <div className="mt-16 animate-slide-up-delay-4">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-brand-dark">
                Ihr Weg zu den perfekten <span className="text-primary">Remote-Experten</span>
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Unser bewährter 3-Wochen-Prozess bringt Sie sicher und strukturiert zu Ihrer idealen Remote-Fachkraft.
              </p>
            </div>
            <ProjectTimeline 
              onActivityClick={(activity) => navigate('/app/search-requests/new')}
              className="max-w-4xl mx-auto"
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
                    Zum RaaS Hub
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark">Über Hej Talent</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Seit 2020 sind wir der vertrauensvolle Partner für Unternehmen, die auf der Suche nach 
                erstklassigen Remote-Fachkräften sind. Unser Fokus liegt auf der gründlichen Prüfung und 
                Vermittlung von internationalen Remote-Talenten.
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