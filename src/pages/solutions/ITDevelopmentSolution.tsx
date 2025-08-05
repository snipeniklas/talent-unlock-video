import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Cloud, Database, GitBranch, TestTube, Target, CheckCircle, TrendingUp, Zap } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

const ITDevelopmentSolution = () => {
  const coreProblems = [
    "Releases verzögern sich durch Fachkräftemangel",
    "Tech-Debt wächst, Stabilität sinkt", 
    "Onboarding externer Entwickler kostet Wochen"
  ];

  const techCompetencies = [
    {
      title: "Architektur & Microservices",
      description: "Domain-Driven Design, Kubernetes, Docker",
      icon: Code
    },
    {
      title: "Cloud-Native Development",
      description: "AWS, Azure, GCP",
      icon: Cloud
    },
    {
      title: "Full-Stack Expertise",
      description: "React, Angular, Vue, Node.js, .NET Core, Java/Spring Boot",
      icon: Database
    },
    {
      title: "DevOps & CI/CD",
      description: "GitLab CI, Jenkins, Terraform, Ansible",
      icon: GitBranch
    },
    {
      title: "Testing & QA",
      description: "TDD, BDD, Cypress, JUnit",
      icon: TestTube
    }
  ];

  const approach = [
    "Tech Audit & Architekturbewertung",
    "Team-Zusammenstellung (Senior Engineers, Team Leads)",
    "Agile Integration (Scrum/Kanban Setup, Jira Confluence)",
    "Wissenstransfer & Documentation"
  ];

  const results = [
    "Verkürzte Time-to-Market um bis zu 50 %",
    "Niedrigere Fehlerquoten dank automatisierter Tests",
    "Nachhaltige Codequalität & modularer Aufbau"
  ];

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Code className="w-4 h-4 mr-2 text-primary" />
              IT-Development
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight animate-fade-in">
              Skalierbare Entwicklung, wenn Ihr IT-Team am Limit ist
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in-delay-1">
              Für CTOs, Tech-Leads und Product Owner, die ihre Entwicklungskapazitäten erweitern möchten
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
              <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
                Tech-Audit jetzt buchen
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 border-primary text-primary hover:bg-primary hover:text-white">
                Mehr erfahren
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Problems */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Kernprobleme</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-delay-1">
              Diese technischen Herausforderungen bremsen Ihr Wachstum
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {coreProblems.map((problem, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-brand-dark font-medium">{problem}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Competence */}
      <section className="py-20 bg-gradient-subtle px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Unsere Technologie-Kompetenz</h2>
            <p className="text-xl text-muted-foreground animate-fade-in-delay-1">
              Modernste Technologien und bewährte Architekturen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techCompetencies.map((item, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-500 hover:scale-105 group animate-slide-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-lg text-brand-dark group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm group-hover:text-brand-dark transition-colors">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Unser Vorgehen</h2>
            <p className="text-xl text-muted-foreground animate-fade-in-delay-1">
              Strukturiert, agil und ergebnisorientiert
            </p>
          </div>

          <div className="space-y-6">
            {approach.map((step, index) => (
              <div key={index} className="flex items-center gap-6 p-6 bg-blue-50 rounded-lg animate-slide-in-right" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                  {index + 1}
                </div>
                <p className="text-lg font-medium text-brand-dark">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-gradient-subtle px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark animate-fade-in">Ergebnisse</h2>
            <p className="text-xl text-muted-foreground animate-fade-in-delay-1">
              Messbare Verbesserungen für Ihre Software-Entwicklung
            </p>
          </div>

          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-4 p-6 bg-green-50 rounded-lg animate-slide-in-left" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-medium text-brand-dark">{result}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
            Bereit für beschleunigte Entwicklung?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-delay-1">
            Lassen Sie uns Ihre technische Architektur analysieren und Optimierungspotentiale identifizieren.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
            <Button size="lg" variant="secondary" className="text-lg px-8 bg-white text-primary hover:bg-gray-100">
              <Zap className="w-5 h-5 mr-2" />
              Tech-Audit jetzt buchen
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
              Success Stories ansehen
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4">HeyTalent</h3>
              <p className="text-gray-300 text-sm">
                Ihr Partner für skalierbare Software-Entwicklung und technische Exzellenz.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Lösungen</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/solutions/backoffice" className="text-gray-300 hover:text-white transition-colors">Backoffice</a></li>
                <li><a href="/solutions/it-development" className="text-gray-300 hover:text-white transition-colors">IT-Development</a></li>
                <li><a href="/solutions/ai-ml" className="text-gray-300 hover:text-white transition-colors">AI & ML</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-300">kontakt@hejtalent.de</li>
                <li className="text-gray-300">+49 89 9017 6218</li>
                <li className="text-gray-300">München, Deutschland</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Impressum</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Datenschutz</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">AGB</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 HeyTalent. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ITDevelopmentSolution;