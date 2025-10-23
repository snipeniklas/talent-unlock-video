import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Settings, Zap, Mail, Save, RotateCcw, Building2, AtSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export default function OutreachProfile() {
  const queryClient = useQueryClient();
  
  // State
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [emailSignature, setEmailSignature] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch user data with company info
  const { data: userData } = useQuery({
    queryKey: ['userData', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id, companies(id, name, website, value_proposition)')
        .eq('user_id', currentUser.id)
        .single();
      
      return profile;
    },
    enabled: !!currentUser?.id
  });

  // Fetch email signature
  const { data: emailSettings } = useQuery({
    queryKey: ['emailSettings', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data } = await supabase
        .from('user_email_settings')
        .select('email_signature')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      return data;
    },
    enabled: !!currentUser?.id
  });

  // Load company data
  useEffect(() => {
    if (userData?.companies) {
      setCompanyName(userData.companies.name || '');
      setCompanyWebsite(userData.companies.website || '');
      setValueProposition(userData.companies.value_proposition || '');
    }
  }, [userData]);

  // Load email signature
  useEffect(() => {
    if (emailSettings?.email_signature) {
      setEmailSignature(emailSettings.email_signature);
    }
  }, [emailSettings]);

  const handleSave = async () => {
    if (!currentUser?.id || !userData?.company_id) {
      toast({
        title: 'Fehler',
        description: 'Benutzerdaten konnten nicht geladen werden.',
        variant: 'destructive'
      });
      return;
    }

    if (!companyName.trim()) {
      toast({
        title: 'Validierungsfehler',
        description: 'Firmenname ist erforderlich.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      // Save company profile
      const { error: companyError } = await supabase
        .from('companies')
        .update({
          name: companyName,
          website: companyWebsite,
          value_proposition: valueProposition
        })
        .eq('id', userData.company_id);

      if (companyError) throw companyError;

      // Save email signature
      const { error: signatureError } = await supabase
        .from('user_email_settings')
        .upsert({
          user_id: currentUser.id,
          email_signature: emailSignature
        }, {
          onConflict: 'user_id'
        });

      if (signatureError) throw signatureError;

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['userData'] });
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });

      toast({
        title: '✅ Profil gespeichert',
        description: 'Ihr Outreach-Profil wurde erfolgreich aktualisiert.',
      });

    } catch (error: any) {
      toast({
        title: 'Fehler beim Speichern',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (userData?.companies) {
      setCompanyName(userData.companies.name || '');
      setCompanyWebsite(userData.companies.website || '');
      setValueProposition(userData.companies.value_proposition || '');
    }
    if (emailSettings?.email_signature) {
      setEmailSignature(emailSettings.email_signature);
    } else {
      setEmailSignature('');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Outreach Profil</h1>
        <p className="text-muted-foreground">
          Ihr Absenderprofil für E-Mail-Kampagnen
        </p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <CardTitle>Firmenprofil</CardTitle>
          </div>
          <CardDescription>
            Informationen über Ihr Unternehmen für personalisierte Outreach-Kampagnen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Firmenname *</Label>
            <Input 
              id="companyName"
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Hej Talent GmbH"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Website</Label>
            <Input 
              id="companyWebsite"
              type="url" 
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              placeholder="https://hejtalent.de"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valueProposition">Wertversprechen *</Label>
            <Textarea 
              id="valueProposition"
              value={valueProposition}
              onChange={(e) => setValueProposition(e.target.value)}
              className="min-h-[100px]"
              placeholder="Beschreiben Sie, was Ihr Unternehmen einzigartig macht und welchen Mehrwert Sie bieten..."
            />
            <p className="text-xs text-muted-foreground">
              💡 Die KI nutzt diese Information, um relevantere E-Mails zu generieren
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Signature */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AtSign className="w-5 h-5" />
            <CardTitle>E-Mail Signatur</CardTitle>
          </div>
          <CardDescription>
            Ihre Signatur für Outreach E-Mails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailSignature">Signatur</Label>
            <Textarea 
              id="emailSignature"
              value={emailSignature}
              onChange={(e) => setEmailSignature(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
              placeholder="Beste Grüße&#10;&#10;Max Mustermann&#10;Geschäftsführer&#10;Hej Talent GmbH"
            />
            <p className="text-xs text-muted-foreground">
              💡 Sie können HTML verwenden (&lt;p&gt;, &lt;br&gt;, &lt;strong&gt;)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>API-Integration</CardTitle>
          </div>
          <CardDescription>
            Integrierte Dienste für automatisiertes Outreach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <Badge variant="secondary">OpenAI</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                E-Mail-Generierung
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <Badge variant="secondary">Perplexity</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Lead Research
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-green-500" />
                <Badge variant="secondary">MS365</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                E-Mail-Versand
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            💡 API-Keys werden zentral verwaltet
          </p>
        </CardContent>
      </Card>

      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <CardTitle>Workflow-Übersicht</CardTitle>
          </div>
          <CardDescription>
            Automatisierter Outreach-Prozess
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Lead-Management</h4>
                <p className="text-sm text-muted-foreground">
                  Kontakte werden in der CRM-Datenbank verwaltet
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-semibold">AI-Research</h4>
                <p className="text-sm text-muted-foreground">
                  Perplexity AI recherchiert Hintergrundinformationen
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-semibold">E-Mail Outreach</h4>
                <p className="text-sm text-muted-foreground">
                  OpenAI generiert personalisierte E-Mails und versendet sie über MS365
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Zurücksetzen
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !companyName.trim()}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
      </div>
    </div>
  );
}
