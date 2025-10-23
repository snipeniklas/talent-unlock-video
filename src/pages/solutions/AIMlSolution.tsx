import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RaasInquiryDialog } from '@/components/RaasInquiryDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Database, BarChart3, Bot, Target, CheckCircle, Users, Phone, Lightbulb } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import { useTranslation } from '@/i18n/i18n';

const AIMlSolution = () => {
  const { t, get } = useTranslation();

  const targetAudience = get<string[]>('solutions.aiMl.audience', [
    "CIOs und Data-Strategen",
    "Innovationsmanager und Chief Digital Officers",
    "Product Owner für AI-Projekte",
    "Startups mit KI/ML-Ambitionen"
  ]);

  const coreProblems = get<Array<{ title: string; description: string }>>('solutions.aiMl.problems', [
    { title: "Mangel an KI-Expertise im Unternehmen", description: "Schwierigkeiten, qualifizierte Data Scientists und ML-Engineers zu finden" },
    { title: "Hohe Kosten für KI-Spezialisten", description: "KI-Experten sind extrem teuer und selten verfügbar" },
    { title: "Komplexität von KI-Projekten unterschätzt", description: "KI-Projekte erfordern spezielle Kompetenzen und Erfahrung" }
  ]);

  const aiSpecialists = get<Array<{ role: string; skills: string; specialization: string; experience: string }>>('solutions.aiMl.roles', [
    { role: "Machine Learning Engineers", skills: "TensorFlow, PyTorch, scikit-learn, MLOps, Model Deployment", specialization: "ML-Pipeline Development, Model Training & Optimization", experience: "4+ Jahre" },
    { role: "Data Scientists", skills: "Python, R, Statistical Analysis, Predictive Modeling, Feature Engineering", specialization: "Data Analysis, Business Intelligence, Statistical Modeling", experience: "5+ Jahre" },
    { role: "AI/NLP Spezialisten", skills: "HuggingFace, OpenAI, LangChain, Prompt Engineering, Chatbots", specialization: "Natural Language Processing, Conversational AI", experience: "3+ Jahre" },
    { role: "Computer Vision Engineers", skills: "OpenCV, YOLO, CNN, Image Processing, Object Detection", specialization: "Image Recognition, Video Analysis, Visual AI", experience: "4+ Jahre" },
    { role: "MLOps Engineers", skills: "Docker, Kubernetes, MLflow, Kubeflow, CI/CD for ML", specialization: "ML Infrastructure, Model Deployment, Monitoring", experience: "4+ Jahre" },
    { role: "AI Product Consultants", skills: "AI Strategy, Business Case Development, ROI Analysis", specialization: "AI Implementation Strategy, Business Integration", experience: "6+ Jahre" }
  ]);

  const aiTechnologies = get<Array<{ name: string; tools: string[] }>>('solutions.aiMl.tech', [
    { name: "Machine Learning", tools: ["TensorFlow", "PyTorch", "scikit-learn", "XGBoost"] },
    { name: "Deep Learning", tools: ["Neural Networks", "CNN", "RNN", "Transformers"] },
    { name: "NLP & LLMs", tools: ["HuggingFace", "OpenAI", "LangChain", "BERT"] },
    { name: "Computer Vision", tools: ["OpenCV", "YOLO", "Object Detection", "OCR"] },
    { name: "MLOps", tools: ["MLflow", "Kubeflow", "Docker", "Kubernetes"] },
    { name: "Data Engineering", tools: ["Apache Spark", "Airflow", "dbt", "BigQuery"] }
  ]);

  const benefits = get<string[]>('solutions.aiMl.benefits', [
    "Zugang zu Top-KI-Experten international",
    "Flexible Projektlaufzeiten: von Proof of Concepts bis Langzeitprojekte",
    "Komplette KI-Teams oder einzelne Spezialisten",
    "Praxiserprobte Erfahrung in verschiedenen Branchen",
    "Schneller Projektstart: KI-Experten in 1-2 Wochen verfügbar",
    "Keine langfristigen Personalverpflichtungen"
  ]);

  const results = get<Array<{ metric: string; description: string }>>('solutions.aiMl.results', [
    { metric: "70%", description: "Erfolgreiche KI-Projekte" },
    { metric: "50%", description: "Kosteneinsparung vs. lokale KI-Experten" },
    { metric: "3x", description: "Schnellere Implementierung" },
    { metric: "90%", description: "Kundenzufriedenheit mit KI-Lösungen" }
  ]);

  const useCases = get<Array<{ title: string; description: string; result: string }>>('solutions.aiMl.useCases', [
    { title: "Chatbots & Customer Service AI", description: "Intelligente Kundenservice-Automatisierung mit NLP", result: "80% Reduzierung der Support-Anfragen" },
    { title: "Predictive Analytics", description: "Vorhersagemodelle für Sales, Inventory und Maintenance", result: "30% Verbesserung der Forecast-Genauigkeit" },
    { title: "Computer Vision Anwendungen", description: "Automatisierte Bild- und Videoanalyse", result: "95% Genauigkeit bei Objekterkennung" }
  ]);

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary text-white px-6 py-2 text-lg">{t('solutions.aiMl.hero.badge', 'Remote KI & ML-Spezialisten')}</Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              {t('solutions.aiMl.hero.title', 'Erfahrene Remote ')}<span className="text-primary">KI</span>{t('solutions.aiMl.hero.titleSuffix', '-Experten für Ihre AI-Projekte')}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('solutions.aiMl.hero.text', 'Realisieren Sie Ihre KI-Visionen mit erstklassigen Remote-Spezialisten. Von Machine Learning bis Computer Vision - wir haben die Experten für Ihr Projekt.')}
            </p>
            <RaasInquiryDialog
              source="ai-ml-solution-hero"
              trigger={
                <Button size="lg" className="text-lg px-8 bg-primary text-white hover:bg-primary-hover">
                  {t('solutions.aiMl.hero.cta', 'RaaS Anfrage erstellen')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.aiMl.audienceTitle', 'Für wen?')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {targetAudience.map((audience, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gradient-subtle rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.aiMl.problemsTitle', 'Kernprobleme')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {coreProblems.map((problem, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      {index===0 ? <Brain className="w-8 h-8 text-white" /> : index===1 ? <Target className="w-8 h-8 text-white" /> : <Database className="w-8 h-8 text-white" />}
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

      {/* AI Specialists */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.aiMl.rolesTitle', 'Unsere KI-Spezialisten')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiSpecialists.map((specialist, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">{specialist.role}</CardTitle>
                    <Badge variant="outline" className="w-fit">{specialist.experience} {t('solutions.aiMl.experience', 'Erfahrung')}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{specialist.specialization}</p>
                    <p className="text-sm font-medium">{specialist.skills}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Technologies */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.aiMl.techTitle', 'KI-Technologie-Expertise')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiTechnologies.map((tech, index) => (
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

      {/* Use Cases */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.aiMl.useCasesTitle', 'Erfolgreiche KI-Anwendungsfälle')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-primary">{useCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{useCase.description}</p>
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">{useCase.result}</span>
                    </div>
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.aiMl.benefitsTitle', 'Ihre Vorteile')}</h2>
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.aiMl.resultsTitle', 'Messbare Ergebnisse')}</h2>
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
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">
            {t('solutions.aiMl.cta.title', 'Bereit für KI-Innovation?')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('solutions.aiMl.cta.text', 'Sprechen Sie mit uns über Ihre KI-Visionen. Wir finden die passenden Remote-Experten für Ihr AI-Projekt.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RaasInquiryDialog
              source="ai-ml-solution-cta"
              trigger={
                <Button size="lg" className="text-lg px-8 bg-primary text-white hover:bg-primary-hover">
                  <Phone className="w-5 h-5 mr-2" />
                  {t('solutions.aiMl.cta.primary', 'RaaS Anfrage erstellen')}
                </Button>
              }
            />
            <Button variant="outline" size="lg" className="text-lg px-8 border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white">
              {t('solutions.aiMl.cta.secondary', 'KI-Experten kennenlernen')}
            </Button>
          </div>
        </div>
      </section>
      
      <ContactCTA />
      <PublicFooter />
    </div>
  );
};

export default AIMlSolution;