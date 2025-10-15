import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Users, Globe, TrendingUp, Award, Clock, CheckCircle } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import { useTranslation } from '@/i18n/i18n';
import { TeamCard } from '@/components/TeamCard';

const AboutUs = () => {
  const { t, get } = useTranslation();

  const teamMembers = [
    {
      name: "Joachim Kalff",
      role: t('aboutUs.team.joachim.role', 'Gründer & Geschäftsführer'),
      image: "/lovable-uploads/joachim-kalff.jpg",
      initials: "JK",
      bio: {
        p1: `Mein Name ist Joachim Kalff, Gründer und Geschäftsführer von Hej Talent. Mit unserem „RaaS"-Konzept denken wir HR-Prozesse neu: frischer, smarter, einfach besser! „Hej" kommt aus dem Skandinavischen und bedeutet „hallo" – eine Begrüßung mit „Wake-up"-Charakter. Für mich steht es für Freundlichkeit, Leichtigkeit und Sympathie.`,
        p2: `Gleichzeitig vereint „Hej" die Initialen meiner Kinder Henry und Emilia – das „J" steht für meinen Vornamen. So verbinde ich die positive skandinavische Haltung mit meiner persönlichen Handschrift. Genauso gehe ich auch mit unserem internationalen Remote-Team um: verantwortungsbewusst, wertschätzend und nahbar.`,
        p3: `Mit Begeisterung und unternehmerischem Antrieb entwickle ich Lösungen, die nachhaltig wirken und echten Mehrwert schaffen – pragmatisch, kreativ und immer mit Blick nach vorn.`
      },
      qa: {
        q1: `Warum ist das Thema Personal wichtig für mich?`,
        a1: `Weil Unternehmen nicht durch Produkte, sondern durch Menschen wachsen. Hinter jedem Erfolg stehen Talente, die ihre Persönlichkeit, Ideen und Energie einbringen.`,
        q2: `Was treibt mich bei Hej Talent an?`,
        a2: `Verbindungen zu schaffen, die über KI hinausgehen – echte Begegnungen, die auf Vertrauen, Authentizität und gemeinsamen Werten beruhen. Denn Technologie kann vieles, aber menschliche Tiefe und Vertrauen niemals ersetzen.`,
        q3: `Meine schönsten Momente bei Hej Talent sind…`,
        a3: `…wenn Talente und Unternehmen merken, dass sie nicht nur fachlich, sondern auch menschlich zusammenpassen. Dann wird aus einem Job eine echte Chance fürs Leben.`
      }
    },
    {
      name: "Pascal Spieß",
      role: t('aboutUs.team.pascal.role', 'Consultant'),
      image: "/lovable-uploads/pascal-spiess-new.jpg",
      initials: "PS",
      bio: {
        p1: `Ich bin Pascal Spieß, Consultant bei Hej Talent, mit mehr als 11 Jahren Erfahrung in Beratung und Vertrieb. Schon immer hat mich die Frage angetrieben, wie Unternehmen effizienter, flexibler und erfolgreicher arbeiten können – und genau hier setze ich heute an.`,
        p2: `Es begeistert mich, gemeinsam mit meinen Kunden in unserem „RaaS"-Konzept zu arbeiten - schnell, flexibel und kostengünstig.`,
        p3: `Bei Hej Talent unterstütze ich Unternehmen, den Fachkräftemangel zu überwinden und Prozesse nachhaltig zu optimieren. Gemeinsam mit unseren Kunden integriere ich internationale Remote-Talente – von AI- und Tech-Talenten über Backoffice- und Buchhaltungsprofis bis hin zu IT- und Softwareentwicklern.`
      },
      qa: {
        q1: `Warum ist das Thema Personal wichtig für mich?`,
        a1: `Weil die richtige Person am richtigen Ort mehr bewirken kann als jede Strategie. Personal ist nicht nur eine Ressource, sondern das Herzstück jeder Organisation.`,
        q2: `Was treibt mich bei Hej Talent an?`,
        a2: `Die Überzeugung, dass Karrieren nicht von Zufällen oder Algorithmen abhängen sollten. Sondern von Begegnungen, die Sinn stiften und Türen öffnen.`,
        q3: `Meine schönsten Momente bei Hej Talent sind…`,
        a3: `…wenn Menschen merken: „Hier werde ich gesehen – so wie ich bin." Genau dann entstehen Chancen, die weit über den nächsten Job hinausgehen.`
      }
    }
  ];

  const milestones = [
    {
      year: "2016",
      title: t('aboutUs.milestones.2016.title', 'Gründung von Hej Talent'),
      description: t('aboutUs.milestones.2016.desc', 'Start als spezialisierte Remote-Recruiting Plattform')
    },
    {
      year: "2021",
      title: t('aboutUs.milestones.2021.title', 'Erste 100 Vermittlungen'),
      description: t('aboutUs.milestones.2021.desc', 'Erfolgreiche Platzierung von 100+ Remote-Fachkräften')
    },
    {
      year: "2022",
      title: t('aboutUs.milestones.2022.title', 'Internationale Expansion'),
      description: t('aboutUs.milestones.2022.desc', 'Erweiterung des Netzwerks auf 15+ Länder')
    },
    {
      year: "2023",
      title: t('aboutUs.milestones.2023.title', 'Best Remote Recruiting Platform'),
      description: t('aboutUs.milestones.2023.desc', 'Auszeichnung als führende Remote-Recruiting Plattform')
    },
    {
      year: "2024",
      title: t('aboutUs.milestones.2024.title', '500+ Remote-Fachkräfte'),
      description: t('aboutUs.milestones.2024.desc', 'Über 500 geprüfte internationale Experten im Netzwerk')
    }
  ];

  const values = [
    {
      icon: Globe,
      title: t('aboutUs.values.0.title', 'Internationale Expertise'),
      description: t('aboutUs.values.0.desc', 'Wir verbinden deutsche Unternehmen mit den besten internationalen Talenten weltweit.')
    },
    {
      icon: CheckCircle,
      title: t('aboutUs.values.1.title', 'Geprüfte Qualität'),
      description: t('aboutUs.values.1.desc', 'Jede Remote-Fachkraft durchläuft unseren mehrstufigen Qualifizierungsprozess.')
    },
    {
      icon: Clock,
      title: t('aboutUs.values.2.title', 'Schnelle Vermittlung'),
      description: t('aboutUs.values.2.desc', 'Von der Anfrage bis zur Integration in nur 2-4 Wochen.')
    },
    {
      icon: TrendingUp,
      title: t('aboutUs.values.3.title', 'Messbare Erfolge'),
      description: t('aboutUs.values.3.desc', '98% Kundenzufriedenheit und über 90% Projektfortführungsrate.')
    }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-brand-dark mb-4 lg:mb-6 leading-tight">
              {t('aboutUs.hero.title', 'Über ')}<span className="text-primary">Hej Talent</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 lg:mb-12 max-w-3xl mx-auto">
              {t('aboutUs.hero.subtitle', 'Seit 2020 sind wir Deutschlands führende Plattform für internationale Remote-Fachkräfte. Wir verbinden Unternehmen mit den besten Talenten weltweit.')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-dark mb-4 lg:mb-6">
                  {t('aboutUs.mission.title', 'Unsere Mission')}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground mb-4 lg:mb-6 leading-relaxed">
                  {t('aboutUs.mission.p1', 'Wir machen internationale Expertise für deutsche Unternehmen zugänglich. Mit unserem Resources as a Service (RaaS) Modell revolutionieren wir die Art, wie Unternehmen auf Fachkräfte zugreifen – flexibel, effizient und ohne Grenzen.')}
                </p>
                <p className="text-base md:text-lg text-muted-foreground mb-4 lg:mb-6 leading-relaxed">
                  {t('aboutUs.mission.p2', 'Statt langwieriger Einstellungsprozesse bieten wir flexible Dienstleistungsverträge mit geprüften Remote-Experten aus über 15 Ländern.')}
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 lg:gap-4">
                  {get<string[]>('aboutUs.mission.stats', ['500+ internationale Fachkräfte', '150+ erfolgreiche Projekte', '98% Kundenzufriedenheit'])?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="font-medium text-sm lg:text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mt-8 lg:mt-0">
                {values.map((value, index) => (
                  <Card key={index} className="text-center p-4 lg:p-6 hover:shadow-lg transition-shadow">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                      <value.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-brand-dark mb-2 text-sm lg:text-base">{value.title}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">{value.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Über uns - Joachim & Pascal Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-dark text-center mb-8 lg:mb-12">
              {t('aboutUs.team.title', 'Über uns - Joachim & Pascal')}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {teamMembers.map((member, index) => (
                <TeamCard key={index} member={member} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-dark text-center mb-12">
              {t('aboutUs.development.title', 'Unsere Entwicklung seit 2020')}
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
              {t('aboutUs.why.title', 'Warum internationale Fachkräfte?')}
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto">
              {t('aboutUs.why.subtitle', 'Der deutsche Fachkräftemangel erfordert neue Lösungen. Unsere internationalen Remote-Experten bieten nicht nur kostengünstige Alternativen, sondern auch frische Perspektiven und Expertise aus globalen Märkten.')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8">
                <div className="text-4xl font-bold text-primary mb-4">60%</div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{t('aboutUs.why.cards.0.title', 'Kosteneinsparung')}</h3>
                <p className="text-muted-foreground">
                  {t('aboutUs.why.cards.0.desc', 'Durchschnittliche Ersparnis gegenüber lokalen Vollzeitkräften')}
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="text-4xl font-bold text-primary mb-4">15+</div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{t('aboutUs.why.cards.1.title', 'Länder')}</h3>
                <p className="text-muted-foreground">
                  {t('aboutUs.why.cards.1.desc', 'Internationale Expertise aus verschiedenen Zeitzonen')}
                </p>
              </Card>
              
              <Card className="text-center p-8">
                <div className="text-4xl font-bold text-primary mb-4">24/7</div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{t('aboutUs.why.cards.2.title', 'Verfügbarkeit')}</h3>
                <p className="text-muted-foreground">
                  {t('aboutUs.why.cards.2.desc', 'Kontinuierliche Produktivität durch globale Zeitzone-Abdeckung')}
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
            {t('aboutUs.cta.title', 'Bereit für internationale Verstärkung?')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('aboutUs.cta.subtitle', 'Entdecken Sie, wie unsere internationalen Remote-Fachkräfte Ihr Unternehmen voranbringen können.')}
          </p>
          <Button asChild size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
            <Link to="/app/search-requests/new">
              {t('aboutUs.cta.button', 'Kostenlose RaaS Anfrage starten')}
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