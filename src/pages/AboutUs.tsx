import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Users, Globe, TrendingUp, Award, Clock, CheckCircle } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import { useLanguage } from '@/contexts/LanguageContext';

const AboutUs = () => {
  const { t } = useLanguage();
  
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
      title: t('about.values.international.title'),
      description: t('about.values.international.description')
    },
    {
      icon: CheckCircle,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description')
    },
    {
      icon: Clock,
      title: t('about.values.speed.title'),
      description: t('about.values.speed.description')
    },
    {
      icon: TrendingUp,
      title: t('about.values.success.title'),
      description: t('about.values.success.description')
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
              {t('about.title')}
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              {t('about.subtitle')}
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
                  {t('about.mission.title')}
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {t('about.mission.description1')}
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {t('about.mission.description2')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="font-medium">{t('about.mission.specialists')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                    <span className="font-medium">{t('about.mission.projects')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="font-medium">{t('about.mission.satisfaction')}</span>
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
                    Mein Name ist Joachim Kalff, Gründer und Geschäftsführer von Hej Talent. Mit unserem „RaaS"-Konzept denken wir HR-Prozesse neu: frischer, smarter, einfach besser! „Hej" kommt aus dem Skandinavischen und bedeutet „hallo" – eine Begrüßung mit „Wake-up"-Charakter. Für mich steht es für Freundlichkeit, Leichtigkeit und Sympathie.
                  </p>
                  <p className="mb-4">
                    Gleichzeitig vereint „Hej" die Initialen meiner Kinder Henry und Emilia – das „J" steht für meinen Vornamen. So verbinde ich die positive skandinavische Haltung mit meiner persönlichen Handschrift. Genauso gehe ich auch mit unserem internationalen Remote-Team um: verantwortungsbewusst, wertschätzend und nahbar.
                  </p>
                  <p className="mb-6">
                    Mit Begeisterung und unternehmerischem Antrieb entwickle ich Lösungen, die nachhaltig wirken und echten Mehrwert schaffen – pragmatisch, kreativ und immer mit Blick nach vorn.
                  </p>
                  
                  {/* Q&A Section for Joachim */}
                  <div className="space-y-4 border-t pt-6">
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Warum ist das Thema Personal wichtig für mich?</h4>
                      <p className="text-sm">Weil Unternehmen nicht durch Produkte, sondern durch Menschen wachsen. Hinter jedem Erfolg stehen Talente, die ihre Persönlichkeit, Ideen und Energie einbringen.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Was treibt mich bei hejTalent an?</h4>
                      <p className="text-sm">Verbindungen zu schaffen, die über KI hinausgehen – echte Begegnungen, die auf Vertrauen, Authentizität und gemeinsamen Werten beruhen. Denn Technologie kann vieles, aber menschliche Tiefe und Vertrauen niemals ersetzen.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Meine schönsten Momente bei hejTalent sind…</h4>
                      <p className="text-sm">…wenn Talente und Unternehmen merken, dass sie nicht nur fachlich, sondern auch menschlich zusammenpassen. Dann wird aus einem Job eine echte Chance fürs Leben.</p>
                    </div>
                  </div>
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
                  <p className="mb-6">
                    Bei Hej Talent unterstütze ich Unternehmen, den Fachkräftemangel zu überwinden und Prozesse nachhaltig zu optimieren. Gemeinsam mit unseren Kunden integriere ich internationale Remote-Talente – von AI- und Tech-Talenten über Backoffice- und Buchhaltungsprofis bis hin zu IT- und Softwareentwicklern.
                  </p>
                  
                  {/* Q&A Section for Pascal */}
                  <div className="space-y-4 border-t pt-6">
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Warum ist das Thema Personal wichtig für mich?</h4>
                      <p className="text-sm">Weil die richtige Person am richtigen Ort mehr bewirken kann als jede Strategie. Personal ist nicht nur eine Ressource, sondern das Herzstück jeder Organisation.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Was treibt mich bei hejTalent an?</h4>
                      <p className="text-sm">Die Überzeugung, dass Karrieren nicht von Zufällen oder Algorithmen abhängen sollten. Sondern von Begegnungen, die Sinn stiften und Türen öffnen.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-dark mb-2">Meine schönsten Momente bei hejTalent sind…</h4>
                      <p className="text-sm">…wenn Menschen merken: „Hier werde ich gesehen – so wie ich bin." Genau dann entstehen Chancen, die weit über den nächsten Job hinausgehen.</p>
                    </div>
                  </div>
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