import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { RaasInquiryDialog } from '@/components/RaasInquiryDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Calculator, FileText, Clock, Target, CheckCircle, Star, Phone, Briefcase, TrendingUp, Award } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import { useTranslation } from '@/i18n/i18n';

const BackofficeSolution = () => {
  const { t, get } = useTranslation();

  const targetAudience = get<string[]>('solutions.backoffice.audience', [
    'Geschäftsführer kleiner und mittlerer Unternehmen',
    'Office-Manager und Assistenzteams',
    'Buchhalter und Controlling-Verantwortliche',
    'HR-Verantwortliche'
  ]);

  const coreProblems = get<Array<{ title: string; description: string; icon?: string }>>('solutions.backoffice.problems', [
    { title: 'Hohe Personalkosten im administrativen Bereich', description: 'Vollzeit-Backoffice-Kräfte vor Ort sind teuer und oft nicht voll ausgelastet' },
    { title: 'Zeitaufwändige Routine-Aufgaben', description: 'Administration und Buchhaltung binden wertvolle Ressourcen, die für Kerngeschäft fehlen' },
    { title: 'Schwankende Arbeitsbelastung', description: 'Saisonale oder projektbedingte Spitzen schwer mit festem Personal abdecken' }
  ]);

  const remoteTalents = get<Array<{ role: string; skills: string; experience: string }>>('solutions.backoffice.talents', [
    { role: 'Virtuelle Assistenten', skills: 'E-Mail-Management, Terminplanung, Kundenkommunikation, Datenerfassung', experience: '3+ Jahre Erfahrung' },
    { role: 'Remote Buchhalter', skills: 'Finanzbuchhaltung, Lohnabrechnung, Controlling, Steuervorbereitungen', experience: '5+ Jahre Erfahrung, DATEV-zertifiziert' },
    { role: 'Administrative Spezialisten', skills: 'Projektmanagement, Qualitätsmanagement, Compliance, Dokumentation', experience: '4+ Jahre Branchenerfahrung' },
    { role: 'Customer Service Agents', skills: 'Kundenbetreuung, Beschwerdemanagement, CRM-Systeme, Verkaufsunterstützung', experience: '3+ Jahre im Kundenservice' }
  ]);

  const backofficeTools = get<Array<{ category: string; tools: string[]; description: string }>>('solutions.backoffice.tools', [
    { 
      category: 'Buchhaltung & Finanzen', 
      tools: ['DATEV', 'Lexoffice', 'QuickBooks', 'Xero'],
      description: 'Professionelle Buchhaltungssysteme für präzise Finanzabwicklung'
    },
    { 
      category: 'CRM & Vertrieb', 
      tools: ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho CRM'],
      description: 'Kundenmanagement und Vertriebsunterstützung'
    },
    { 
      category: 'Kommunikation', 
      tools: ['Slack', 'Microsoft Teams', 'Zoom', 'Google Meet'],
      description: 'Nahtlose Team-Kommunikation und Videokonferenzen'
    },
    { 
      category: 'Projektmanagement', 
      tools: ['Asana', 'Trello', 'Monday.com', 'Jira'],
      description: 'Effiziente Aufgabenverwaltung und Projektorganisation'
    },
    { 
      category: 'HR & Personal', 
      tools: ['Personio', 'BambooHR', 'Workday', 'SAP SuccessFactors'],
      description: 'Personalverwaltung und HR-Prozesse'
    },
    { 
      category: 'Office & Dokumentation', 
      tools: ['Microsoft 365', 'Google Workspace', 'Notion', 'Confluence'],
      description: 'Dokumentenmanagement und Zusammenarbeit'
    }
  ]);

  const useCases = get<Array<{ title: string; description: string; results: string[]; icon?: string }>>('solutions.backoffice.useCases', [
    {
      title: 'Buchhaltung & Finanzen',
      description: 'Ein mittelständisches E-Commerce-Unternehmen automatisierte seine Rechnungsstellung und Finanzbuchhaltung mit Remote-Buchhaltern',
      results: [
        '50% Zeitersparnis bei monatlichen Abschlüssen',
        '60% Kostenreduktion gegenüber lokaler Vollzeitkraft',
        '99% Fehlerfreiheit durch doppelte Prüfung'
      ]
    },
    {
      title: 'Customer Support & CRM',
      description: 'Ein SaaS-Startup skalierte seinen Kundensupport mit Remote Customer Service Agents und verbesserter CRM-Betreuung',
      results: [
        '95% Kundenzufriedenheits-Score',
        '3x schnellere Response-Zeiten',
        'Erweiterte Servicezeiten ohne Mehrkosten'
      ]
    },
    {
      title: 'Administrative Prozesse',
      description: 'Eine Steuerberatung digitalisierte Workflows und Dokumentenmanagement mit virtuellen Assistenten',
      results: [
        '60% Effizienzsteigerung bei Routineaufgaben',
        '40 Stunden/Woche mehr Zeit für Kerngeschäft',
        'Verbesserte Compliance und Dokumentation'
      ]
    }
  ]);

  const benefits = get<string[]>('solutions.backoffice.benefits', [
    'Bis zu 60% Kosteneinsparung gegenüber lokalen Vollzeitkräften',
    'Flexible Skalierung je nach Bedarf (Stunden, Tage, Monate)',
    'Internationale Remote-Fachkräfte mit optimaler Zeitzone-Abdeckung',
    'Schneller Start: Einsatzbereit in 1-2 Wochen',
    'Keine HR-Aufwände: Wir übernehmen Recruiting und Betreuung',
    'Backup-Lösungen bei Ausfall verfügbar'
  ]);

  const results = get<Array<{ metric: string; description: string }>>('solutions.backoffice.results', [
    { metric: '60%', description: 'Kosteneinsparung im Backoffice' },
    { metric: '40h/Woche', description: 'Freigesetzte Zeit für Kerngeschäft' },
    { metric: '98%', description: 'Kundenzufriedenheit mit Remote-Kräften' },
    { metric: '2 Wochen', description: 'Durchschnittliche Einarbeitungszeit' }
  ]);

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-subtle overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-8 bg-gradient-primary text-white px-8 py-3 text-xl font-semibold shadow-lg border-0">
              {t('solutions.backoffice.hero.badge', 'Remote Backoffice-Fachkräfte')}
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-dark mb-8 leading-tight">
              {t('solutions.backoffice.hero.title', 'Qualifizierte ')}<span className="text-primary">Remote</span>{t('solutions.backoffice.hero.titleSuffix', '-Unterstützung ')}
              <span className="bg-gradient-hero bg-clip-text text-transparent">{t('solutions.backoffice.hero.highlight', ' für Ihr Backoffice')}</span>
            </h1>
            <p className="text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto font-light">
              {t('solutions.backoffice.hero.text', 'Entlasten Sie Ihr Team mit erfahrenen Remote-Fachkräften für Administration, Buchhaltung und operative Aufgaben. Flexibel, kostengünstig und sofort einsatzbereit.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <RaasInquiryDialog
                source="backoffice-solution-hero"
                trigger={
                  <Button size="lg" className="text-xl px-12 py-6 bg-primary text-white hover:bg-primary-hover hover:shadow-xl hover:scale-105 transition-all duration-300 border-0">
                    <Phone className="w-6 h-6 mr-3" />
                    {t('solutions.backoffice.hero.ctaPrimary', 'RaaS Anfrage erstellen')}
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                }
              />
              <Button variant="outline" size="lg" className="text-xl px-12 py-6 border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105">
                {t('solutions.backoffice.hero.ctaSecondary', 'Remote Backoffice-Kräfte entdecken')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.backoffice.audienceTitle', 'Für wen?')}</h2>
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.backoffice.problemsTitle', 'Kernprobleme')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {coreProblems.map((problem, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      {index===0 ? <Calculator className="w-8 h-8 text-white" /> : index===1 ? <Clock className="w-8 h-8 text-white" /> : <FileText className="w-8 h-8 text-white" />}
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.backoffice.talentsTitle', 'Unsere Remote-Fachkräfte')}</h2>
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

      {/* Backoffice Tools & Software */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-4">
              {t('solutions.backoffice.toolsTitle', 'Backoffice Tools & Software')}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              {t('solutions.backoffice.toolsSubtitle', 'Unsere Remote-Fachkräfte sind versiert im Umgang mit führenden Backoffice-Tools und können nahtlos in Ihre bestehende IT-Infrastruktur integriert werden.')}
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {backofficeTools.map((toolCategory, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      {index === 0 ? <Calculator className="w-6 h-6 text-primary" /> :
                       index === 1 ? <Target className="w-6 h-6 text-primary" /> :
                       index === 2 ? <Users className="w-6 h-6 text-primary" /> :
                       index === 3 ? <FileText className="w-6 h-6 text-primary" /> :
                       index === 4 ? <Briefcase className="w-6 h-6 text-primary" /> :
                       <Clock className="w-6 h-6 text-primary" />}
                    </div>
                    <CardTitle className="text-lg text-brand-dark">{toolCategory.category}</CardTitle>
                    <CardDescription className="text-sm">{toolCategory.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {toolCategory.tools.map((tool, toolIndex) => (
                        <Badge key={toolIndex} variant="secondary" className="text-xs">
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

      {/* Use Cases / Erfolgsgeschichten */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-4">
              {t('solutions.backoffice.useCasesTitle', 'Erfolgreiche Backoffice-Anwendungsfälle')}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              {t('solutions.backoffice.useCasesSubtitle', 'Reale Beispiele, wie Unternehmen ihre Backoffice-Prozesse mit unseren Remote-Fachkräften optimiert haben.')}
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-t-4 border-t-primary">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                      {index === 0 ? <Calculator className="w-8 h-8 text-white" /> :
                       index === 1 ? <Users className="w-8 h-8 text-white" /> :
                       <TrendingUp className="w-8 h-8 text-white" />}
                    </div>
                    <CardTitle className="text-xl text-center text-brand-dark">{useCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm text-center">{useCase.description}</p>
                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-brand-dark">Ergebnisse:</span>
                      </div>
                      {useCase.results.map((result, resultIndex) => (
                        <div key={resultIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{result}</span>
                        </div>
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
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.backoffice.benefitsTitle', 'Ihre Vorteile')}</h2>
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">{t('solutions.backoffice.resultsTitle', 'Messbare Ergebnisse')}</h2>
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
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            {t('solutions.backoffice.cta.title', 'Bereit für Remote Backoffice-Unterstützung?')}
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
            {t('solutions.backoffice.cta.text', 'Sprechen Sie mit uns über Ihre Anforderungen. Wir finden die passenden Remote-Fachkräfte für Ihr Backoffice.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <RaasInquiryDialog
              source="backoffice-solution-cta"
              trigger={
                <Button size="lg" className="text-xl px-12 py-6 bg-white text-primary hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <Phone className="w-6 h-6 mr-3" />
                  {t('solutions.backoffice.cta.primary', 'RaaS Anfrage erstellen')}
                </Button>
              }
            />
            <Button variant="outline" size="lg" className="text-xl px-12 py-6 border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105">
              {t('solutions.backoffice.cta.secondary', 'Remote-Fachkräfte kennenlernen')}
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