import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Code, Shield } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import { RaasInquiryDialog } from '@/components/RaasInquiryDialog';
import { useTranslation } from '@/i18n/i18n';

const SolutionsOverview = () => {
  const navigate = useNavigate();
  const { t, get } = useTranslation();

  const solutionsData = get<Array<{title: string; description: string; benefits: string[]; cta: string}>>('solutionsOverview.solutions', []);
  
  const icons = [Users, Code, Shield];
  const ids = ['backoffice', 'it-development', 'ai-ml'];
  
  const solutions = solutionsData.map((sol, index) => ({
    id: ids[index],
    title: sol.title,
    description: sol.description,
    icon: icons[index],
    benefits: sol.benefits,
    cta: sol.cta
  }));

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-brand-dark mb-4 lg:mb-6 leading-tight">
              {t('solutionsOverview.title')}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 lg:mb-12 max-w-3xl mx-auto">
              {t('solutionsOverview.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {solutions.map((solution, index) => (
              <Card 
                key={solution.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group border-2 hover:border-primary h-full flex flex-col"
                onClick={() => navigate(`/solutions/${solution.id}`)}
              >
                <CardHeader className="text-center pb-4 lg:pb-6 flex-shrink-0">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6 group-hover:animate-bounce">
                    <solution.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <CardTitle className="text-lg lg:text-2xl group-hover:text-primary transition-colors mb-3 lg:mb-4">
                    {solution.title}
                  </CardTitle>
                  <CardDescription className="text-sm lg:text-lg group-hover:text-brand-dark transition-colors">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col p-4 lg:p-6">
                  <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6 flex-1">
                    {solution.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-sm lg:text-base text-muted-foreground group-hover:text-brand-dark transition-colors">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-primary hover:bg-primary-hover group-hover:scale-105 transition-transform text-sm lg:text-base py-2 lg:py-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/solutions/${solution.id}`);
                    }}
                  >
                    {solution.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">
            {t('solutionsOverview.ctaTitle')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('solutionsOverview.ctaText')}
          </p>
          <RaasInquiryDialog
            source="solutions-overview-cta"
            trigger={
              <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover">
                {t('solutionsOverview.ctaButton')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            }
          />
        </div>
      </section>
      
      <ContactCTA />
      <PublicFooter />
    </div>
  );
};

export default SolutionsOverview;