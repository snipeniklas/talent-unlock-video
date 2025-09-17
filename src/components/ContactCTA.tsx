import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, Phone, MapPin, Clock, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactCTA = () => {
  const { t } = useLanguage();
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('contact.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-bold text-brand-dark mb-8">{t('contact.speak')}</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-dark">{t('contact.labels.email')}</div>
                  <a href="mailto:kontakt@hejcompany.de" className="text-primary hover:underline">
                    kontakt@hejcompany.de
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-dark">{t('contact.labels.phone')}</div>
                  <a href="tel:+4989901762180" className="text-primary hover:underline">
                    +49 89 9017 6218
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Linkedin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-dark">{t('contact.labels.linkedin')}</div>
                  <a href="https://www.linkedin.com/company/hejtalent/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {t('contact.labels.linkedin')}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-dark">{t('contact.labels.location')}</div>
                  <span className="text-muted-foreground">{t('contact.location')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="shadow-lg border-0">
             <CardHeader>
               <CardTitle className="text-2xl text-brand-dark">{t('contact.form.title')}</CardTitle>
               <p className="text-muted-foreground">
                 {t('contact.form.subtitle')}
               </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder={t('contact.form.placeholders.firstName')} />
                <Input placeholder={t('contact.form.placeholders.lastName')} />
              </div>
              <Input placeholder={t('contact.form.placeholders.email')} type="email" />
              <Input placeholder={t('contact.form.placeholders.company')} />
              <Input placeholder={t('contact.form.placeholders.phone')} />
              <Textarea placeholder={t('contact.form.placeholders.description')} className="h-32" />
              <Button asChild className="w-full bg-gradient-primary hover:shadow-xl transition-all duration-300 text-lg py-6 border-0">
                <Link to="/app/search-requests/new">
                  {t('contact.form.cta')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;