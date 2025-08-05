import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Server, Smartphone, Database, Cloud, GitBranch, CheckCircle, Target, Users, Phone } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

const ITDevelopmentSolution = () => {
  const targetAudience = [
    "CTOs und Technical Leaders",
    "Startup-Gründer mit Tech-Bedarf",
    "Product Owner und Produktmanager",
    "Agenturen und Beratungsunternehmen"
  ];

  const coreProblems = [
    {
      title: "Fachkräftemangel im IT-Bereich",
      description: "Schwierigkeiten, qualifizierte Entwickler zu finden und langfristig zu halten",
      icon: Users
    },
    {
      title: "Hohe Personalkosten für IT-Expertise",
      description: "Senior-Entwickler sind teuer und oft nicht dauerhaft verfügbar",
      icon: Target
    },
    {
      title: "Skalierungsprobleme bei wachsenden Projekten",
      description: "Schwierig, das Entwicklerteam schnell an Projektanforderungen anzupassen",
      icon: Server
    }
  ];

  const remoteDevelopers = [
    {
      role: "Full-Stack Entwickler",
      skills: "React, Node.js, Python, Django, JavaScript/TypeScript",
      specialization: "Web-Anwendungen, APIs, Frontend & Backend",
      experience: "5+ Jahre"
    },
    {
      role: "DevOps Engineers",
      skills: "AWS, Docker, Kubernetes, CI/CD, Infrastructure as Code",
      specialization: "Cloud-Migration, Deployment-Automation, Monitoring",
      experience: "4+ Jahre"
    },
    {
      role: "Mobile App Entwickler",
      skills: "React Native, Flutter, iOS (Swift), Android (Kotlin)",
      specialization: "Cross-Platform Apps, Native Development",
      experience: "4+ Jahre"
    },
    {
      role: "Backend Spezialisten",
      skills: "Java, .NET, Go, Microservices, Database Design",
      specialization: "Skalierbare Architekturen, Performance-Optimierung",
      experience: "6+ Jahre"
    },
    {
      role: "Frontend Experten",
      skills: "React, Vue.js, Angular, UI/UX Implementation",
      specialization: "Responsive Design, Performance, Accessibility",
      experience: "4+ Jahre"
    },
    {
      role: "QA & Test Engineers",
      skills: "Automated Testing, Manual QA, Test-Driven Development",
      specialization: "Quality Assurance, Bug Detection, Test Automation",
      experience: "3+ Jahre"
    }
  ];

  const technologies = [
    { name: "Frontend", tools: ["React", "Vue.js", "Angular", "TypeScript"] },
    { name: "Backend", tools: ["Node.js", "Python", "Java", ".NET", "Go"] },
    { name: "Mobile", tools: ["React Native", "Flutter", "iOS", "Android"] },
    { name: "Cloud", tools: ["AWS", "Azure", "Google Cloud", "Docker"] },
    { name: "Database", tools: ["PostgreSQL", "MongoDB", "Redis", "MySQL"] },
    { name: "DevOps", tools: ["Kubernetes", "CI/CD", "Terraform", "Jenkins"] }
  ];

  const benefits = [
    "Zugang zu Top-Entwicklern aus Deutschland und Europa",
    "Flexible Team-Zusammenstellung je nach Projektanforderungen",
    "Agile Arbeitsweise und moderne Entwicklungspraktiken",
    "Deutsche Zeitzone und Sprachkenntnisse",
    "Schneller Projektstart: Entwickler in 1-2 Wochen einsatzbereit",
    "Keine Recruiting-Kosten oder HR-Aufwände"
  ];

  const results = [
    { metric: "50%", description: "Schnellere Entwicklungszeiten" },
    { metric: "40%", description: "Kosteneinsparung vs. lokale Entwickler" },
    { metric: "95%", description: "Projekterfolgsrate" },
    { metric: "1-2 Wochen", description: "Time-to-Start für neue Entwickler" }
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary text-white px-6 py-2 text-lg">Remote IT-Entwickler</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Erfahrene Remote-Entwickler für Ihre IT-Projekte
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Verstärken Sie Ihr IT-Team mit qualifizierten Remote-Entwicklern aus Deutschland und Europa. 
              Von Full-Stack Development bis DevOps - wir haben die Experten für Ihr Projekt.
            </p>
            <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
              Remote IT-Experten finden
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
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
                  <Code className="w-6 h-6 text-primary" />
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

      {/* Remote Developers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Unsere Remote-Entwickler</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {remoteDevelopers.map((developer, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{developer.role}</CardTitle>
                    <Badge variant="outline" className="w-fit">{developer.experience} Erfahrung</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{developer.specialization}</p>
                    <p className="text-sm font-medium">{developer.skills}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">Technologie-Expertise</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {technologies.map((tech, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{tech.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {tech.tools.map((tool, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
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
      <section className="py-16 bg-gradient-subtle">
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
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">
            Bereit für Remote IT-Verstärkung?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sprechen Sie mit uns über Ihre Entwicklungsanforderungen. Wir finden die passenden Remote-Entwickler für Ihr Projekt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
              <Phone className="w-5 h-5 mr-2" />
              Kostenloses Tech-Gespräch
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Entwickler-Profile ansehen
            </Button>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
};

export default ITDevelopmentSolution;