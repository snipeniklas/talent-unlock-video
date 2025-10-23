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
import { RaasInquiryDialog } from '@/components/RaasInquiryDialog';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-brand-dark mb-4 lg:mb-6 leading-tight">
              {t('contact.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 lg:mb-12">
              {t('contact.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4 lg:mb-6">{t('contact.talkToUs')}</h2>
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start gap-3 lg:gap-4">
                  <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm lg:text-base">{t('contact.labels.email')}</div>
                  <a href="mailto:hello@hejtalent.de" className="text-muted-foreground text-sm lg:text-base hover:text-primary break-all">
                    hello@hejtalent.de
                  </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm lg:text-base">{t('contact.labels.phone')}</div>
                    <a href="tel:+498990176218" className="text-muted-foreground text-sm lg:text-base hover:text-primary">
                      +49 89 9017 6218
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm lg:text-base">{t('contact.labels.address')}</div>
                    <div className="text-muted-foreground text-sm lg:text-base">Herzogstrasse 19, 80803 München, Germany</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 lg:gap-4">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm lg:text-base">{t('contact.labels.hours')}</div>
                    <div className="text-muted-foreground text-sm lg:text-base">Mo-Fr 9:00-18:00 Uhr</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.form.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 lg:p-6">
                <RaasInquiryDialog
                  source="contact-page"
                  trigger={
                    <Button className="w-full bg-primary hover:bg-primary-hover text-sm lg:text-base py-3">
                      {t('contact.form.submit')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  }
                />
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