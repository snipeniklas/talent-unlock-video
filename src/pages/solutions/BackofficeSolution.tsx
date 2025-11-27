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

  interface Problem {
    title: string;
    description: string;
  }

  interface Talent {
    role: string;
    skills: string;
    experience: string;
  }

  interface Tool {
    category: string;
    tools: string[];
    description: string;
  }

  interface UseCase {
    title: string;
    description: string;
    results: string[];
  }

  interface Result {
    metric: string;
    description: string;
  }

  const targetAudience = get<string[]>('solutions.backoffice.audience', []);
  const coreProblems = get<Problem[]>('solutions.backoffice.problems', []);
  const remoteTalents = get<Talent[]>('solutions.backoffice.talents', []);
  const backofficeTools = get<Tool[]>('solutions.backoffice.tools', []);
  const useCases = get<UseCase[]>('solutions.backoffice.useCases', []);
  const benefits = get<string[]>('solutions.backoffice.benefits', []);
  const results = get<Result[]>('solutions.backoffice.results', []);

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-subtle overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Badge className="mb-8 bg-gradient-primary text-white px-8 py-3 text-xl font-semibold shadow-lg border-0">
              {t('solutions.backoffice.hero.badge')}
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-dark mb-8 leading-tight">
              {t('solutions.backoffice.hero.title')}
              <span className="text-primary">{t('solutions.backoffice.hero.titleHighlight')}</span>
              {t('solutions.backoffice.hero.titleSuffix')}
              <span className="bg-gradient-hero bg-clip-text text-transparent">{t('solutions.backoffice.hero.highlight')}</span>
            </h1>
            <p className="text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto font-light">
              {t('solutions.backoffice.hero.text')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <RaasInquiryDialog
                source="backoffice-solution-hero"
                trigger={
                  <Button size="lg" className="text-xl px-12 py-6 bg-primary text-white hover:bg-primary-hover hover:shadow-xl hover:scale-105 transition-all duration-300 border-0">
                    <Phone className="w-6 h-6 mr-3" />
                    {t('solutions.backoffice.hero.ctaPrimary')}
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                }
              />
              <Button variant="outline" size="lg" className="text-xl px-12 py-6 border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105">
                {t('solutions.backoffice.hero.ctaSecondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              {t('solutions.backoffice.audienceTitle')}
            </h2>
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              {t('solutions.backoffice.problemsTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {coreProblems.map((problem, index) => (
                <Card key={index} className="bg-white text-center hover:shadow-lg transition-shadow">
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              {t('solutions.backoffice.talentsTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {remoteTalents.map((talent, index) => (
                <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
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
              {t('solutions.backoffice.toolsTitle')}
            </h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
              {t('solutions.backoffice.toolsSubtitle')}
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {backofficeTools.map((toolCategory, index) => (
                <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300 hover:scale-105">
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              {t('solutions.backoffice.useCasesTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="bg-white hover:shadow-lg transition-all duration-300 hover:scale-105 border-t-4 border-t-primary">
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
                        <span className="text-xs font-semibold text-brand-dark">
                          {t('solutions.backoffice.resultsTitle')}:
                        </span>
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              {t('solutions.backoffice.benefitsTitle')}
            </h2>
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
            <h2 className="text-3xl font-bold text-brand-dark text-center mb-12">
              {t('solutions.backoffice.resultsTitle')}
            </h2>
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
            {t('solutions.backoffice.cta.title')}
          </h2>
          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto font-light">
            {t('solutions.backoffice.cta.text')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <RaasInquiryDialog
              source="backoffice-solution-cta"
              trigger={
                <Button size="lg" className="text-xl px-12 py-6 bg-white text-primary hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <Phone className="w-6 h-6 mr-3" />
                  {t('solutions.backoffice.cta.primary')}
                </Button>
              }
            />
            <Button variant="outline" size="lg" className="text-xl px-12 py-6 border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105">
              {t('solutions.backoffice.cta.secondary')}
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