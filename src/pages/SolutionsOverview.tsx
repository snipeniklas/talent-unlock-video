import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Code, Shield } from "lucide-react";

const SolutionsOverview = () => {
  const navigate = useNavigate();

  const solutions = [
    {
      id: 'backoffice',
      title: 'Operative Rückendeckung im Tagesgeschäft',
      description: 'Prozessoptimierung, Automation und virtuelle Assistenz für mehr Effizienz',
      icon: Users,
      benefits: ['40% Zeitersparnis bei Routine-Tasks', 'Transparente Kennzahlen & Reports', 'Freedom to scale'],
      cta: 'Prozess-Workshop gratis anfragen'
    },
    {
      id: 'it-development',
      title: 'Skalierbare Entwicklung, wenn Ihr IT-Team am Limit ist',
      description: 'Full-Stack Development, DevOps und Architektur-Expertise',
      icon: Code,
      benefits: ['50% kürzere Time-to-Market', 'Niedrigere Fehlerquoten', 'Nachhaltige Codequalität'],
      cta: 'Tech-Audit jetzt buchen'
    },
    {
      id: 'ai-ml',
      title: 'KI-Projekte, die wirklich liefern',
      description: 'MLOps, Datenstrategie und produktive KI-Implementierungen',
      icon: Shield,
      benefits: ['30% Effizienzsteigerung', '95% Vorhersagegenauigkeit', 'Skalierbare ML-Lösungen'],
      cta: 'MLOps-Assessment anfordern'
    }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Unsere Lösungen
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Spezialisierte Remote-Teams für jeden Bereich - von operativer Unterstützung 
              bis hin zu komplexen KI-Implementierungen.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {solutions.map((solution, index) => (
              <Card 
                key={solution.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 hover:border-primary h-full"
                onClick={() => navigate(`/solutions/${solution.id}`)}
              >
                <CardHeader className="text-center pb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce">
                    <solution.icon className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                    {solution.title}
                  </CardTitle>
                  <CardDescription className="text-lg group-hover:text-brand-dark transition-colors">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {solution.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary-hover group-hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/solutions/${solution.id}`);
                    }}
                  >
                    {solution.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">
            Nicht sicher, welche Lösung die richtige für Sie ist?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lassen Sie uns in einem kostenlosen Strategiegespräch gemeinsam die beste Lösung für Ihre Herausforderungen finden.
          </p>
          <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
            Kostenloses Strategiegespräch buchen
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SolutionsOverview;