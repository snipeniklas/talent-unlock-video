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
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-6">
            {t('contactCTA.title', 'Kontakt aufnehmen')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('contactCTA.subtitle', 'Lassen Sie uns gemeinsam die passenden Remote-Fachkräfte für Ihr Unternehmen finden')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <h3 className="text-2xl font-bold text-brand-dark mb-8">{t('contactCTA.talkToUs', 'Sprechen Sie uns an')}</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-dark">{t('contactCTA.labels.email', 'E-Mail')}</div>
                  <a href="mailto:kontakt@hejtalent.de" className="text-primary hover:underline">
                    kontakt@hejtalent.de
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-dark">{t('contactCTA.labels.phone', 'Telefon')}</div>
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
                  <div className="font-semibold text-brand-dark">{t('contactCTA.labels.linkedin', 'LinkedIn Profil')}</div>
                  <a href="https://www.linkedin.com/company/hejtalent/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    LinkedIn
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-brand-dark">{t('contactCTA.labels.location', 'Standort')}</div>
                  <span className="text-muted-foreground">{t('contactCTA.location', 'München, Deutschland')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="shadow-lg border-0">
             <CardHeader>
               <CardTitle className="text-2xl text-brand-dark">{t('contactCTA.form.title', 'Suchauftrag kostenlos erstellen')}</CardTitle>
               <p className="text-muted-foreground">
                 {t('contactCTA.form.subtitle', 'Erzählen Sie uns von Ihrem Projekt und wir melden uns binnen 24 Stunden')}
               </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder={t('contactCTA.form.placeholders.firstName', 'Vorname')} />
                <Input placeholder={t('contactCTA.form.placeholders.lastName', 'Nachname')} />
              </div>
              <Input placeholder={t('contactCTA.form.placeholders.email', 'E-Mail-Adresse')} type="email" />
              <Input placeholder={t('contactCTA.form.placeholders.company', 'Unternehmen')} />
              <Input placeholder={t('contactCTA.form.placeholders.phone', 'Telefon')} />
              <Textarea placeholder={t('contactCTA.form.placeholders.description', 'Beschreiben Sie Ihren Remote-Fachkräfte-Bedarf...')} className="h-32" />
              <Button asChild className="w-full bg-gradient-primary hover:shadow-xl transition-all duration-300 text-lg py-6 border-0">
                <Link to="/app/search-requests/new">
                  {t('contactCTA.form.submit', 'Jetzt kostenfrei Suchauftrag einstellen')}
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