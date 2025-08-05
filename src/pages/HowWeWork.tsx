import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, Users, Rocket, TrendingUp, CheckCircle } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import InteractiveAppScreen from "@/components/InteractiveAppScreen";

const HowWeWork = () => {
  const steps = [
    {
      step: "01",
      title: "Bedarfsanalyse",
      description: "Verstehen Ihrer Anforderungen",
      details: "In einem ausführlichen Gespräch analysieren wir Ihre aktuellen Herausforderungen, gewünschten Skills und Budget. Wir identifizieren die Art der Remote-Fachkräfte, die Sie benötigen.",
      icon: Search,
      timeline: "1-2 Tage"
    },
    {
      step: "02", 
      title: "Kandidaten-Matching",
      description: "Passende Remote-Experten finden",
      details: "Basierend auf Ihrer Bedarfsanalyse präsentieren wir Ihnen 3-5 vorqualifizierte Remote-Kandidaten aus unserem Netzwerk. Jeder Kandidat wird sorgfältig auf Ihre Anforderungen abgestimmt.",
      icon: Users,
      timeline: "3-5 Tage"
    },
    {
      step: "03",
      title: "Interview & Auswahl", 
      description: "Kennenlernen und Entscheidung",
      details: "Sie führen Interviews mit den vorgeschlagenen Kandidaten durch. Wir unterstützen Sie beim gesamten Auswahlprozess und bei Vertragsverhandlungen.",
      icon: Rocket,
      timeline: "1 Woche"
    },
    {
      step: "04",
      title: "Onboarding & Support",
      description: "Erfolgreiche Integration sicherstellen", 
      details: "Wir begleiten das Onboarding Ihrer neuen Remote-Fachkraft und stehen bei Fragen zur Verfügung. Regelmäßige Check-ins sorgen für eine reibungslose Zusammenarbeit.",
      icon: TrendingUp,
      timeline: "Laufend"
    }
  ];

  const benefits = [
    "Schneller Start: Qualifizierte Remote-Fachkraft in unter 2 Wochen",
    "Geprüfte Qualität: Alle Kandidaten durchlaufen unseren Screening-Prozess",
    "Flexible Arbeitsmodelle: Vollzeit, Teilzeit oder projektbasiert",
    "Transparente Kommunikation: Regelmäßige Updates und Feedback",
    "Kultureller Fit: Deutsche und europäische Kandidaten mit ähnlicher Arbeitskultur",
    "Rechtssicherheit: Alle arbeitsrechtlichen Aspekte sind abgedeckt"
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              So funktioniert <span className="text-primary">RaaS</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Von der ersten RaaS-Anfrage bis zur erfolgreichen Integration Ihrer Remote-Ressource - 
              unser bewährter 4-Stufen-Prozess garantiert Ihnen die besten Kandidaten.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8">
              {steps.map((step, index) => (
                <div key={index} className="group">
                  <Card className="transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 hover:border-primary">
                    <div className="grid md:grid-cols-12 gap-6 p-8">
                      {/* Step Number & Icon */}
                      <div className="md:col-span-2 flex flex-col items-center">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 group-hover:animate-bounce">
                          {step.step}
                        </div>
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="md:col-span-8">
                        <h3 className="text-2xl font-bold text-brand-dark mb-2 group-hover:text-primary transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-4 font-medium">
                          {step.description}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.details}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="md:col-span-2 flex flex-col justify-center">
                        <div className="bg-gradient-subtle rounded-lg p-4 text-center">
                          <div className="text-sm text-muted-foreground mb-1">Dauer</div>
                          <div className="font-semibold text-brand-dark">{step.timeline}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Connector Arrow */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center py-4">
                      <ArrowRight className="w-8 h-8 text-primary animate-bounce" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Process Demo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              Erleben Sie den RaaS-Prozess in Aktion
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
              Sehen Sie, wie unsere Plattform jeden Schritt des Prozesses unterstützt und vereinfacht.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              {/* Step 1: Request Creation */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    01
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">RaaS Anfrage erstellen</h3>
                    <p className="text-muted-foreground">Definieren Sie Ihre Anforderungen</p>
                  </div>
                </div>
                <InteractiveAppScreen
                  title="RaaS Anfrage erstellen"
                  description="Starten Sie hier Ihre RaaS-Anfrage - definieren Sie Ihre Anforderungen"
                  screen="search-requests"
                />
              </div>

              {/* Step 2: Dashboard Overview */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    02
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Prozess verfolgen</h3>
                    <p className="text-muted-foreground">Behalten Sie den Überblick</p>
                  </div>
                </div>
                <InteractiveAppScreen
                  title="Projekt Dashboard"
                  description="Verfolgen Sie den Fortschritt Ihrer RaaS-Anfragen"
                  screen="dashboard"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Step 3: Resource Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    03
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Ressourcen entdecken</h3>
                    <p className="text-muted-foreground">Finden Sie passende Experten</p>
                  </div>
                </div>
                <InteractiveAppScreen
                  title="Verfügbare Ressourcen"
                  description="Entdecken Sie qualifizierte Remote-Experten für Ihr Projekt"
                  screen="resources"
                />
              </div>

              {/* Step 4: Request Management */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    04
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark">Anfragen verwalten</h3>
                    <p className="text-muted-foreground">Koordination & Follow-up</p>
                  </div>
                </div>
                <InteractiveAppScreen
                  title="RaaS Anfragen Übersicht"
                  description="Verwalten Sie alle Ihre aktiven und vergangenen Anfragen"
                  screen="search-requests"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              Warum unser Prozess funktioniert
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 group hover:scale-105 transition-transform duration-200">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1 group-hover:animate-bounce">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">
            Bereit für Remote-Verstärkung?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lassen Sie uns in einem kostenlosen Beratungsgespräch über Ihre Anforderungen sprechen 
            und gemeinsam die passenden Remote-Fachkräfte für Ihr Unternehmen finden.
          </p>
          <Button asChild size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
            <Link to="/app/search-requests/new">
              RaaS Anfrage kostenlos erstellen
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
      
      <ContactCTA />
      <PublicFooter />
    </div>
  );
};

export default HowWeWork;