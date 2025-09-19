import React from 'react';
import { useTranslation } from '@/i18n/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Key, 
  Mail, 
  Building2, 
  User, 
  Globe,
  Zap,
  Search,
  Send
} from 'lucide-react';

export default function OutreachProfile() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('outreach.profile.title', 'Outreach Profil')}
          </h1>
          <p className="text-muted-foreground">
            {t('outreach.profile.subtitle', 'Konfiguration für automatisierte Lead-Generierung und E-Mail-Outreach')}
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Settings className="w-4 h-4 mr-2" />
          {t('outreach.status.setup', 'Setup')}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t('outreach.company.title', 'Firmenprofil')}
            </CardTitle>
            <CardDescription>
              {t('outreach.company.description', 'Informationen für die Personalisierung von Outreach-Nachrichten')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">{t('outreach.company.name', 'Firmenname')}</Label>
              <Input 
                id="company-name" 
                placeholder={t('outreach.company.namePlaceholder', 'Ihre Firma GmbH')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">{t('outreach.company.website', 'Website')}</Label>
              <Input 
                id="company-website" 
                placeholder="https://ihr-unternehmen.de"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-value-prop">{t('outreach.company.valueProp', 'Wertversprechen')}</Label>
              <Textarea 
                id="company-value-prop"
                placeholder={t('outreach.company.valuePropPlaceholder', 'Kurze Beschreibung, was Ihr Unternehmen einzigartig macht...')}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('outreach.personal.title', 'Persönliches Profil')}
            </CardTitle>
            <CardDescription>
              {t('outreach.personal.description', 'Ihre Kontaktdaten für E-Mail-Signaturen')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">{t('outreach.personal.firstName', 'Vorname')}</Label>
                <Input id="first-name" placeholder="Max" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">{t('outreach.personal.lastName', 'Nachname')}</Label>
                <Input id="last-name" placeholder="Mustermann" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">{t('outreach.personal.position', 'Position')}</Label>
              <Input 
                id="position" 
                placeholder={t('outreach.personal.positionPlaceholder', 'Geschäftsführer, Vertriebsleiter, etc.')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('outreach.personal.email', 'E-Mail-Adresse')}</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="max@ihr-unternehmen.de"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('outreach.personal.phone', 'Telefon')}</Label>
              <Input 
                id="phone" 
                placeholder="+49 123 456789"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t('outreach.api.title', 'API-Konfiguration')}
          </CardTitle>
          <CardDescription>
            {t('outreach.api.description', 'API-Keys für KI-Funktionen und E-Mail-Versendung')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <h3 className="font-semibold">{t('outreach.api.openai.title', 'OpenAI (E-Mail-Generierung)')}</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openai-key">{t('outreach.api.openai.key', 'OpenAI API Key')}</Label>
              <Input 
                id="openai-key" 
                type="password"
                placeholder="sk-..."
              />
              <p className="text-sm text-muted-foreground">
                {t('outreach.api.openai.description', 'Für die automatische Generierung personalisierter E-Mails')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Perplexity Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <h3 className="font-semibold">{t('outreach.api.perplexity.title', 'Perplexity (Research)')}</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="perplexity-key">{t('outreach.api.perplexity.key', 'Perplexity API Key')}</Label>
              <Input 
                id="perplexity-key" 
                type="password"
                placeholder="pplx-..."
              />
              <p className="text-sm text-muted-foreground">
                {t('outreach.api.perplexity.description', 'Für automatisches Research über Leads und Unternehmen')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Email Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <h3 className="font-semibold">{t('outreach.api.email.title', 'E-Mail-Versendung')}</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resend-key">{t('outreach.api.email.key', 'Resend API Key')}</Label>
              <Input 
                id="resend-key" 
                type="password"
                placeholder="re_..."
              />
              <p className="text-sm text-muted-foreground">
                {t('outreach.api.email.description', 'Für den professionellen E-Mail-Versand über Resend')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t('outreach.workflow.title', 'Workflow-Übersicht')}
          </CardTitle>
          <CardDescription>
            {t('outreach.workflow.description', 'So funktioniert der automatisierte Outreach-Prozess')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
              <Badge variant="outline" className="w-fit">1. {t('outreach.workflow.step1.title', 'Lead-Management')}</Badge>
              <p className="text-sm text-muted-foreground">
                {t('outreach.workflow.step1.description', 'Leads hinzufügen und Status verwalten (new → contacted → qualified → closed)')}
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
              <Badge variant="outline" className="w-fit">2. {t('outreach.workflow.step2.title', 'KI-Research')}</Badge>
              <p className="text-sm text-muted-foreground">
                {t('outreach.workflow.step2.description', 'Automatische Analyse von Leads und Firmen über Perplexity API')}
              </p>
            </div>
            <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
              <Badge variant="outline" className="w-fit">3. {t('outreach.workflow.step3.title', 'E-Mail-Outreach')}</Badge>
              <p className="text-sm text-muted-foreground">
                {t('outreach.workflow.step3.description', 'Personalisierte E-Mail-Generierung und professioneller Versand')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button>
          {t('outreach.actions.save', 'Konfiguration speichern')}
        </Button>
        <Button variant="outline">
          {t('outreach.actions.test', 'Verbindung testen')}
        </Button>
      </div>
    </div>
  );
}