import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin, Building2, FileText, Hash } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useTranslation } from '@/i18n/i18n';

const Impressum = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
                <span className="text-primary">{t('legal.imprint.title', 'Impressum')}</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('legal.imprint.subtitle', 'Rechtliche Informationen gemäß §5 TMG')}
              </p>
            </div>

            <div className="space-y-8">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-primary" />
                    {t('legal.imprint.company.title', 'Firmeninformationen')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Hej Consulting GmbH</h3>
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p>Northern Munich Str. 9c</p>
                        <p>82031 Grünwald</p>
                        <p>Germany</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary" />
                    {t('legal.imprint.register.title', 'Handelsregister')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">{t('legal.imprint.register.court', 'Register Court:')}</h4>
                      <p className="text-muted-foreground">{t('legal.imprint.register.courtValue', 'Munich Local Court')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">{t('legal.imprint.register.number', 'Registration number:')}</h4>
                      <p className="text-muted-foreground">{t('legal.imprint.register.numberValue', 'HRB 263357')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Hash className="w-6 h-6 text-primary" />
                    {t('legal.imprint.vat.title', 'Umsatzsteuer-Identifikationsnummer')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="font-medium mb-2">{t('legal.imprint.vat.label', 'Sales tax identification number according to §27a UStG:')}</h4>
                    <p className="text-muted-foreground font-mono">DE342933121</p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-center">{t('legal.imprint.contact.title', 'Still Have Some Questions Left?')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-medium">{t('legal.imprint.contact.callUs', 'Call us')}</p>
                      <a 
                        href="tel:+498990176218" 
                        className="text-primary hover:text-primary-hover font-semibold transition-colors"
                      >
                        {t('legal.imprint.contact.phone', 'Tel: +49 89 9017 6218')}
                      </a>
                    </div>
                  </div>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {t('legal.imprint.contact.note', 'Feel free to contact our support team to learn more about the services provided by us and multiple offers for Your business!')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      <PublicFooter />
    </div>
  );
};

export default Impressum;