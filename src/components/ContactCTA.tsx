import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, Phone, MapPin, Clock, Linkedin } from "lucide-react";
import { useTranslation } from '@/i18n/i18n';

const ContactCTA = () => {
  const { t } = useTranslation();

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-subtle">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-3 sm:mb-4 md:mb-6">
            {t('contactCTA.title', 'Kontakt aufnehmen')}
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground px-2">
            {t('contactCTA.subtitle', 'Lassen Sie uns gemeinsam die passenden Remote-Fachkräfte für Ihr Unternehmen finden')}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
          <div className="order-2 lg:order-1">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-brand-dark mb-4 sm:mb-6 md:mb-8">{t('contactCTA.talkToUs', 'Sprechen Sie uns an')}</h3>
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-brand-dark text-sm sm:text-base">{t('contactCTA.labels.email', 'E-Mail')}</div>
                  <a href="mailto:kontakt@hejtalent.de" className="text-primary hover:underline text-sm sm:text-base break-all">
                    kontakt@hejtalent.de
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-brand-dark text-sm sm:text-base">{t('contactCTA.labels.phone', 'Telefon')}</div>
                  <a href="tel:+4989901762180" className="text-primary hover:underline text-sm sm:text-base">
                    +49 89 9017 6218
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Linkedin className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-brand-dark text-sm sm:text-base">{t('contactCTA.labels.linkedin', 'LinkedIn Profil')}</div>
                  <a href="https://www.linkedin.com/company/hejtalent/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm sm:text-base">
                    LinkedIn
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-brand-dark text-sm sm:text-base">{t('contactCTA.labels.location', 'Standort')}</div>
                  <span className="text-muted-foreground text-sm sm:text-base">{t('contactCTA.location', 'München, Deutschland')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 max-w-md mx-auto lg:max-w-none">
            <Card className="shadow-lg border-0">
             <CardHeader className="pb-3 sm:pb-4 md:pb-6 px-3 sm:px-6">
               <CardTitle className="text-lg sm:text-xl md:text-2xl text-brand-dark">{t('contactCTA.form.title', 'Suchauftrag kostenlos erstellen')}</CardTitle>
               <p className="text-muted-foreground text-sm sm:text-base">
                 {t('contactCTA.form.subtitle', 'Erzählen Sie uns von Ihrem Projekt und wir melden uns binnen 24 Stunden')}
               </p>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
              <div className="grid gap-3 sm:gap-4">
                <Input placeholder={t('contactCTA.form.placeholders.firstName', 'Vorname')} className="text-sm sm:text-base h-10 sm:h-11" />
                <Input placeholder={t('contactCTA.form.placeholders.lastName', 'Nachname')} className="text-sm sm:text-base h-10 sm:h-11" />
              </div>
              <Input placeholder={t('contactCTA.form.placeholders.email', 'E-Mail-Adresse')} type="email" className="text-sm sm:text-base h-10 sm:h-11" />
              <Input placeholder={t('contactCTA.form.placeholders.company', 'Unternehmen')} className="text-sm sm:text-base h-10 sm:h-11" />
              <Input placeholder={t('contactCTA.form.placeholders.phone', 'Telefon')} className="text-sm sm:text-base h-10 sm:h-11" />
              <Textarea placeholder={t('contactCTA.form.placeholders.description', 'Beschreiben Sie Ihren Remote-Fachkräfte-Bedarf...')} className="h-20 sm:h-24 md:h-28 text-sm sm:text-base resize-none" />
              <Button asChild className="w-full bg-gradient-primary hover:shadow-xl transition-all duration-300 text-sm sm:text-base py-3 sm:py-4 border-0 h-auto">
                <Link to="/app/search-requests/new">
                  <span className="truncate">Jetzt starten</span>
                  <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 flex-shrink-0" />
                </Link>
              </Button>
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;