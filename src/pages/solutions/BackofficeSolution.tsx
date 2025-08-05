import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Calculator, FileText, Clock, Target, CheckCircle, Star, Phone } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";

const BackofficeSolution = () => {
  const targetAudience = [
    "Geschäftsführer kleiner und mittlerer Unternehmen",
    "Office-Manager und Assistenzteams",
    "Buchhalter und Controlling-Verantwortliche",
    "HR-Verantwortliche"
  ];

  const coreProblems = [
    {
      title: "Hohe Personalkosten im administrativen Bereich",
      description: "Vollzeit-Backoffice-Kräfte vor Ort sind teuer und oft nicht voll ausgelastet",
      icon: Calculator
    },
    {
      title: "Zeitaufwändige Routine-Aufgaben",
      description: "Administration und Buchhaltung binden wertvolle Ressourcen, die für Kerngeschäft fehlen",
      icon: Clock
    },
    {
      title: "Schwankende Arbeitsbelastung",
      description: "Saisonale oder projektbedingte Spitzen schwer mit festem Personal abzudecken",
      icon: FileText
    }
  ];

  const remoteTalents = [
    {
      role: "Virtuelle Assistenten",
      skills: "E-Mail-Management, Terminplanung, Kundenkommunikation, Datenerfassung",
      experience: "3+ Jahre Erfahrung"
    },
    {
      role: "Remote Buchhalter",
      skills: "Finanzbuchhaltung, Lohnabrechnung, Controlling, Steuervorbereitungen",
      experience: "5+ Jahre Erfahrung, DATEV-zertifiziert"
    },
    {
      role: "Administrative Spezialisten",
      skills: "Projektmanagement, Qualitätsmanagement, Compliance, Dokumentation",
      experience: "4+ Jahre Branchenerfahrung"
    },
    {
      role: "Customer Service Agents",
      skills: "Kundenbetreuung, Beschwerdemanagement, CRM-Systeme, Verkaufsunterstützung",
      experience: "3+ Jahre im Kundenservice"
    }
  ];

  const benefits = [
    "Bis zu 60% Kosteneinsparung gegenüber lokalen Vollzeitkräften",
    "Flexible Skalierung je nach Bedarf (Stunden, Tage, Monate)",
    "Deutsche Sprachkenntnisse und EU-Zeitzone",
    "Schneller Start: Einsatzbereit in 1-2 Wochen",
    "Keine HR-Aufwände: Wir übernehmen Recruiting und Betreuung",
    "Backup-Lösungen bei Ausfall verfügbar"
  ];

  const results = [
    { metric: "60%", description: "Kosteneinsparung im Backoffice" },
    { metric: "40h/Woche", description: "Freigesetzte Zeit für Kerngeschäft" },
    { metric: "98%", description: "Kundenzufriedenheit mit Remote-Kräften" },
    { metric: "2 Wochen", description: "Durchschnittliche Einarbeitungszeit" }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-subtle overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-8 bg-gradient-primary text-white px-8 py-3 text-xl font-semibold shadow-lg border-0">
              Remote Backoffice-Fachkräfte
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-dark mb-8 leading-tight">
              Qualifizierte Remote-Unterstützung 
              <span className="bg-gradient-hero bg-clip-text text-transparent"> für Ihr Backoffice</span>
            </h1>
            <p className="text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto font-light">
              Entlasten Sie Ihr Team mit erfahrenen Remote-Fachkräften für Administration, 
              Buchhaltung und operative Aufgaben. Flexibel, kostengünstig und sofort einsatzbereit.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="text-xl px-12 py-6 bg-gradient-primary hover:shadow-xl hover:scale-105 transition-all duration-300 border-0">
                <Link to="/app/search-requests/new">
                  <Phone className="w-6 h-6 mr-3" />
                  Suchauftrag kostenlos erstellen
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-xl px-12 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105">
                Remote Backoffice-Kräfte entdecken
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Für wen?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {targetAudience.map((audience, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gradient-subtle rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-brand-dark font-medium">{audience}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Problems */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Kernprobleme</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {coreProblems.map((problem, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <problem.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{problem.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Remote Talents */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Unsere Remote-Fachkräfte</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {remoteTalents.map((talent, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{talent.role}</CardTitle>
                    <Badge variant="outline" className="w-fit">{talent.experience}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{talent.skills}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Ihre Vorteile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Messbare Ergebnisse</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {results.map((result, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{result.metric}</div>
                  <div className="text-muted-foreground">{result.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Bereit für Remote Backoffice-Unterstützung?
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
            Sprechen Sie mit uns über Ihre Anforderungen. Wir finden die passenden Remote-Fachkräfte für Ihr Backoffice.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-xl px-12 py-6 bg-white text-primary hover:bg-white/90 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Link to="/app/search-requests/new">
                <Phone className="w-6 h-6 mr-3" />
                Suchauftrag kostenlos erstellen
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-xl px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105">
              Remote-Fachkräfte kennenlernen
            </Button>
          </div>
        </div>
      </section>
      
      <ContactCTA />
      <PublicFooter />
    </div>
  );
};

export default BackofficeSolution;