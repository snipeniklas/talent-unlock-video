import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Users, Globe, TrendingUp, Award, Clock, CheckCircle } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";

const AboutUs = () => {
  const milestones = [
    {
      year: "2020",
      title: "Gründung von Hej Talent",
      description: "Start als spezialisierte Remote-Recruiting Plattform"
    },
    {
      year: "2021",
      title: "Erste 100 Vermittlungen",
      description: "Erfolgreiche Platzierung von 100+ Remote-Fachkräften"
    },
    {
      year: "2022",
      title: "Internationale Expansion",
      description: "Erweiterung des Netzwerks auf 15+ Länder"
    },
    {
      year: "2023",
      title: "Best Remote Recruiting Platform",
      description: "Auszeichnung als führende Remote-Recruiting Plattform"
    },
    {
      year: "2024",
      title: "500+ Remote-Fachkräfte",
      description: "Über 500 geprüfte internationale Experten im Netzwerk"
    }
  ];

  const values = [
    {
      icon: Globe,
      title: "Internationale Expertise",
      description: "Wir verbinden deutsche Unternehmen mit den besten internationalen Talenten weltweit."
    },
    {
      icon: CheckCircle,
      title: "Geprüfte Qualität",
      description: "Jede Remote-Fachkraft durchläuft unseren mehrstufigen Qualifizierungsprozess."
    },
    {
      icon: Clock,
      title: "Schnelle Vermittlung",
      description: "Von der Anfrage bis zur Integration in nur 2-4 Wochen."
    },
    {
      icon: TrendingUp,
      title: "Messbare Erfolge",
      description: "98% Kundenzufriedenheit und über 90% Projektfortführungsrate."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Über <span className="text-primary">Hej Talent</span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Seit 2020 sind wir Deutschlands führende Plattform für internationale Remote-Fachkräfte. 
              Wir verbinden Unternehmen mit den besten Talenten weltweit.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">
                  Unsere Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Wir machen internationale Expertise für deutsche Unternehmen zugänglich. 
                  Unser <span className="font-semibold text-primary">Resources as a Service (RaaS)</span> Modell 
                  revolutioniert die Art, wie Unternehmen auf Fachkräfte zugreifen.
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Statt langwieriger Einstellungsprozesse bieten wir flexible Dienstleistungsverträge 
                  mit geprüften Remote-Experten aus über 15 Ländern.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="font-medium">500+ internationale Fachkräfte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="font-medium">150+ erfolgreiche Projekte</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="font-medium">98% Kundenzufriedenheit</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-brand-dark mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Über uns - Joachim & Pascal Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark text-center mb-12">
              Über uns - Joachim & Pascal
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Joachim Kalff */}
              <Card className="p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarFallback className="text-xl font-semibold bg-primary text-white">
                      JK
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">Joachim Kalff</h3>
                  <p className="text-lg text-primary font-semibold">Gründer & Geschäftsführer</p>
                </div>
                <div className="text-muted-foreground leading-relaxed">
                  <p className="mb-4">
                    Mein Name ist Joachim Kalff, ich bin Gründer und Geschäftsführer von Hej Talent. Mit unserem „RaaS"-Konzept denken wir HR-Prozesse neu: frischer, smarter, einfach besser! "Hej" kommt aus dem Skandinavischen und bedeutet "hallo", eine Begrüßung mit "Wake Up"-Charakter. Es wirkte auf mich immer freundlich, erfrischend und sympathisch.
                  </p>
                  <p className="mb-4">
                    Außerdem vereint "Hej" die Initialen meiner Kinder Henry und Emilia. Das "J" steht für meinen Vornamen. Ich möchte damit das positive Skandinavische mit Persönlichkeit verbinden und genauso gehe ich das Thema unserer internationalen Remote Mitarbeiter an: Ich übernehme Verantwortung.
                  </p>
                  <p>
                    Mit Herzblut und Leidenschaft entwickele ich innovative und nachhaltige Lösungskonzepte. Down to earth, effizient, kreativ – out of the box.
                  </p>
                </div>
              </Card>

              {/* Pascal Spieß */}
              <Card className="p-8 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarFallback className="text-xl font-semibold bg-primary text-white">
                      PS
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">Pascal Spieß</h3>
                  <p className="text-lg text-primary font-semibold">Consultant</p>
                </div>
                <div className="text-muted-foreground leading-relaxed">
                  <p className="mb-4">
                    Ich bin Pascal Spieß, Consultant bei Hej Talent, mit mehr als 11 Jahren Erfahrung in Beratung und Vertrieb. Schon immer hat mich die Frage angetrieben, wie Unternehmen effizienter, flexibler und erfolgreicher arbeiten können – und genau hier setze ich heute an.
                  </p>
                  <p className="mb-4">
                    Es begeistert mich, gemeinsam mit meinen Kunden in unserem „RaaS"-Konzept zu arbeiten - schnell, flexibel und kostengünstig.
                  </p>
                  <p>
                    Bei Hej Talent unterstütze ich Unternehmen, den Fachkräftemangel zu überwinden und Prozesse nachhaltig zu optimieren. Gemeinsam mit unseren Kunden integriere ich internationale Remote-Talente – von AI- und Tech-Talenten über Backoffice- und Buchhaltungsprofis bis hin zu IT- und Softwareentwicklern.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark text-center mb-12">
              Unsere Entwicklung seit 2020
            </h2>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-dark mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Internationale Fokus Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">
              Warum internationale Fachkräfte?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto">
              Der deutsche Fachkräftemangel erfordert neue Lösungen. Unsere internationalen Remote-Experten 
              bieten nicht nur kostengünstige Alternativen, sondern auch frische Perspektiven und 
              Expertise aus globalen Märkten.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <div className="text-4xl font-bold text-primary mb-4">60%</div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">Kosteneinsparung</h3>
                <p className="text-muted-foreground">
                  Durchschnittliche Ersparnis gegenüber lokalen Vollzeitkräften
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="text-4xl font-bold text-primary mb-4">15+</div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">Länder</h3>
                <p className="text-muted-foreground">
                  Internationale Expertise aus verschiedenen Zeitzonen
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="text-4xl font-bold text-primary mb-4">24/7</div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">Verfügbarkeit</h3>
                <p className="text-muted-foreground">
                  Kontinuierliche Produktivität durch globale Zeitzone-Abdeckung
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">
            Bereit für internationale Verstärkung?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Entdecken Sie, wie unsere internationalen Remote-Fachkräfte Ihr Unternehmen voranbringen können.
          </p>
          <Button asChild size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
            <Link to="/app/search-requests/new">
              Kostenlose RaaS Anfrage starten
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

export default AboutUs;