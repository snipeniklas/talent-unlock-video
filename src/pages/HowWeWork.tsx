import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, Search, Users, Rocket, TrendingUp, CheckCircle, Clock, ChevronDown } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import InteractiveAppScreen from "@/components/InteractiveAppScreen";

const HowWeWork = () => {
  const [openSteps, setOpenSteps] = useState<{[key: number]: boolean}>({});
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

  const stepScreens = ["search-requests", "dashboard", "resources", "search-requests"] as const;

  const toggleStep = (stepIndex: number) => {
    setOpenSteps(prev => ({
      ...prev,
      [stepIndex]: !prev[stepIndex]
    }));
  };

  const benefits = [
    "Schneller Start: Qualifizierte Remote-Fachkraft in unter 2 Wochen",
    "Geprüfte Qualität: Alle Kandidaten durchlaufen unseren Screening-Prozess",
    "Flexible Arbeitsmodelle: Vollzeit, Teilzeit oder projektbasiert",
    "Transparente Kommunikation: Regelmäßige Updates und Feedback",
    "Kultureller Fit: Internationale Remote-Kandidaten mit passender Arbeitskultur",
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
          
          <div className="max-w-6xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-white via-gray-50/50 to-white">
              <CardContent className="p-8 lg:p-12">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
                      RaaS - Ein revolutionäres Servicekonzept
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      <span className="font-semibold text-primary">Resources as a Service (RaaS)</span> ist mehr als nur eine 
                      moderne Bezeichnung – es ist ein grundlegend anderer Ansatz zur Bereitstellung von Fachkräften. 
                      Im Gegensatz zu traditionellen Personalvermittlungen oder Zeitarbeitsfirmen schließen Sie bei uns 
                      <span className="font-semibold"> keinen Arbeitsvertrag</span>, sondern einen flexiblen 
                      <span className="font-semibold text-primary"> Dienstleistungsvertrag</span>.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Diese Unterscheidung ist entscheidend: Während Arbeitsverhältnisse starre Strukturen, 
                      Kündigungsfristen und umfangreiche arbeitsrechtliche Verpflichtungen mit sich bringen, 
                      bietet unser RaaS-Modell <span className="font-semibold">maximale Flexibilität</span>. 
                      Sie erhalten genau die Expertise, die Sie benötigen – wann Sie sie benötigen.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Unsere Remote-Fachkräfte sind nicht Ihre Angestellten, sondern spezialisierte 
                      <span className="font-semibold text-primary"> Dienstleistungspartner</span>, die nahtlos 
                      in Ihre Projektstrukturen integriert werden. Das bedeutet: keine Lohnnebenkosten, 
                      keine Sozialversicherungsbeiträge, keine Urlaubsansprüche oder Krankheitsausfälle 
                      auf Ihrer Seite.
                    </p>
                    <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                      <p className="text-muted-foreground text-lg font-medium">
                        Die Vorteile sind messbar: <span className="font-bold text-primary">Bis zu 60% Kosteneinsparung</span> 
                        gegenüber lokalen Vollzeitkräften, <span className="font-bold">100% planbare Budgets</span> 
                        ohne versteckte Personalkosten und die Möglichkeit, 
                        <span className="font-bold text-primary"> sofort zu skalieren</span> – nach oben oder unten.
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
                      Internationale Expertise ohne Grenzen
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Unser globales Netzwerk umfasst über <span className="font-semibold text-primary">500+ 
                      geprüfte Remote-Fachkräfte</span> aus verschiedenen Zeitzonen und Kulturen. 
                      Diese Vielfalt ist kein Zufall, sondern strategischer Vorteil: Sie erhalten Zugang 
                      zu Talenten und Perspektiven, die lokal nicht verfügbar wären.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Jede unserer Remote-Ressourcen durchläuft einen <span className="font-semibold">
                      mehrstufigen Qualifizierungsprozess</span>: Technische Skills-Tests, 
                      Sprachkompetenz-Prüfungen, Referenz-Validierung und kulturelle Kompatibilitäts-Bewertung. 
                      Das Ergebnis: <span className="font-semibold text-primary">98% Kundenzufriedenheit</span> 
                      und eine durchschnittliche Projektfortführungsrate von über 90%.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Besonders wertvoll ist unsere <span className="font-semibold text-primary">
                      24/7-Verfügbarkeit</span> durch internationale Zeitzonen-Abdeckung. 
                      Während Ihr deutsches Team schläft, arbeiten unsere Ressourcen in anderen 
                      Zeitzonen weiter an Ihren Projekten – ein kontinuierlicher Produktivitätsgewinn.
                    </p>
                    <div className="bg-secondary/5 border-l-4 border-secondary p-4 rounded-r-lg">
                      <p className="text-muted-foreground text-lg font-medium">
                        Die rechtliche Struktur ist dabei kristallklar: <span className="font-bold">
                        Wir übernehmen die vollständige Verantwortung</span> für unsere Remote-Fachkräfte – 
                        von der Vertragsgestaltung über die Qualitätssicherung bis hin zur Backup-Planung 
                        bei Ausfällen. Sie konzentrieren sich ausschließlich auf Ihr Kerngeschäft, 
                        während wir die <span className="font-bold text-primary">operative Exzellenz</span> 
                        Ihrer erweiterten Remote-Teams gewährleisten.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Process Steps */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
                Unser <span className="text-primary">RaaS</span> Prozess in 4 Schritten
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Klicken Sie auf einen Schritt, um die entsprechende App-Ansicht zu sehen
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {steps.map((step, index) => (
                <Collapsible
                  key={index}
                  open={openSteps[index]}
                  onOpenChange={() => toggleStep(index)}
                >
                  <div className="group relative">
                    {/* Step Card */}
                    <CollapsibleTrigger asChild>
                      <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100 hover:border-primary/20 relative overflow-hidden cursor-pointer">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                        
                        {/* Step header */}
                        <div className="flex items-start gap-6 mb-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-3 group-hover:animate-bounce shadow-lg">
                              {step.step}
                            </div>
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                              <step.icon className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold text-brand-dark mb-2 group-hover:text-primary transition-colors">
                                {step.title}
                              </h3>
                              <ChevronDown className={`w-6 h-6 text-primary transition-transform duration-300 ${openSteps[index] ? 'rotate-180' : ''}`} />
                            </div>
                            <p className="text-lg text-primary font-semibold mb-3">
                              {step.description}
                            </p>
                            <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-sm font-medium text-gray-600">
                              <Clock className="w-4 h-4" />
                              {step.timeline}
                            </div>
                          </div>
                        </div>
                        
                        {/* Step details */}
                        <div className="relative z-10">
                          <p className="text-gray-600 leading-relaxed text-lg">
                            {step.details}
                          </p>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Collapsible Content with App Screen */}
                    <CollapsibleContent className="mt-6">
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <InteractiveAppScreen
                          title={`Schritt ${step.step}: ${step.title}`}
                          description={`Sehen Sie hier, wie ${step.title.toLowerCase()} in unserem RaaS Hub funktioniert`}
                          screen={stepScreens[index]}
                        />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
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