import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, Users, Rocket, TrendingUp, CheckCircle } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

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
              So arbeiten wir
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Von der ersten Bedarfsanalyse bis zur erfolgreichen Integration Ihrer Remote-Fachkraft - 
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
          <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
            Kostenloses Beratungsgespräch buchen
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HowWeWork;