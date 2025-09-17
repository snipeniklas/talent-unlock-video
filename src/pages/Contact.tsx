import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useTranslation } from '@/i18n/i18n';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              {t('contact.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-6">{t('contact.talkToUs')}</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">{t('contact.labels.email')}</div>
                    <div className="text-muted-foreground">kontakt@hejcompany.de</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">{t('contact.labels.phone')}</div>
                    <div className="text-muted-foreground">+49 89 9017 6218</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">{t('contact.labels.address')}</div>
                    <div className="text-muted-foreground">Nördliche Münchner Str. 9c, 82031 Grünwald, Germany</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">{t('contact.labels.hours')}</div>
                    <div className="text-muted-foreground">Mo-Fr 9:00-18:00 Uhr</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.form.title')}</CardTitle>
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
                <Button asChild className="w-full bg-primary hover:bg-primary-hover">
                  <Link to="/app/search-requests/new">
                    {t('contact.form.submit')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
};

export default Contact;