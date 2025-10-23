import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmailSequence {
  id?: string;
  sequence_number: number;
  subject_template: string;
  body_template: string;
  delay_days: number;
}

export default function OutreachCampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [desiredCta, setDesiredCta] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [emailSequences, setEmailSequences] = useState<EmailSequence[]>([]);

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ["outreach-campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_campaigns")
        .select(`
          *,
          outreach_campaign_contacts(contact_id),
          outreach_email_sequences(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Redirect if campaign is active or completed
      if (data.status === "active" || data.status === "completed") {
        navigate(`/admin/outreach-campaigns/${id}`);
        toast({
          title: "Nicht erlaubt",
          description: "Aktive oder abgeschlossene Kampagnen können nicht bearbeitet werden.",
          variant: "destructive",
        });
        return null;
      }
      
      return data;
    },
  });

  const { data: contacts } = useQuery({
    queryKey: ["crm-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Pre-fill form when campaign data loads
  useEffect(() => {
    if (campaign) {
      setCampaignName(campaign.name || "");
      setCampaignDescription(campaign.description || "");
      setTargetAudience(campaign.target_audience || "");
      setDesiredCta(campaign.desired_cta || "");
      setAiInstructions(campaign.ai_instructions || "");
      
      // Set selected contacts
      const contactIds = campaign.outreach_campaign_contacts?.map((cc: any) => cc.contact_id) || [];
      setSelectedContacts(contactIds);
      
      // Set email sequences
      const sequences = campaign.outreach_email_sequences?.map((seq: any) => ({
        id: seq.id,
        sequence_number: seq.sequence_number,
        subject_template: seq.subject_template,
        body_template: seq.body_template,
        delay_days: seq.delay_days,
      })) || [];
      setEmailSequences(sequences.length > 0 ? sequences : [{
        sequence_number: 1,
        subject_template: "",
        body_template: "",
        delay_days: 0,
      }]);
    }
  }, [campaign]);

  const updateCampaignMutation = useMutation({
    mutationFn: async () => {
      // Update campaign
      const { error: campaignError } = await supabase
        .from("outreach_campaigns")
        .update({
          name: campaignName,
          description: campaignDescription,
          ai_instructions: aiInstructions,
          target_audience: targetAudience,
          desired_cta: desiredCta,
        })
        .eq("id", id);

      if (campaignError) throw campaignError;

      // Delete existing contacts and add new ones
      const { error: deleteContactsError } = await supabase
        .from("outreach_campaign_contacts")
        .delete()
        .eq("campaign_id", id);

      if (deleteContactsError) throw deleteContactsError;

      const contactsToAdd = selectedContacts.map((contactId) => ({
        campaign_id: id,
        contact_id: contactId,
      }));

      const { error: contactsError } = await supabase
        .from("outreach_campaign_contacts")
        .insert(contactsToAdd);

      if (contactsError) throw contactsError;

      // Delete existing sequences and add new ones
      const { error: deleteSequencesError } = await supabase
        .from("outreach_email_sequences")
        .delete()
        .eq("campaign_id", id);

      if (deleteSequencesError) throw deleteSequencesError;

      const sequencesToAdd = emailSequences.map((seq) => ({
        campaign_id: id,
        sequence_number: seq.sequence_number,
        subject_template: seq.subject_template,
        body_template: seq.body_template,
        delay_days: seq.delay_days,
      }));

      const { error: sequencesError } = await supabase
        .from("outreach_email_sequences")
        .insert(sequencesToAdd);

      if (sequencesError) throw sequencesError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["outreach-campaigns"] });
      toast({
        title: "Kampagne aktualisiert",
        description: "Die Kampagne wurde erfolgreich aktualisiert.",
      });
      navigate(`/admin/outreach-campaigns/${id}`);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const addEmailSequence = () => {
    setEmailSequences([
      ...emailSequences,
      {
        sequence_number: emailSequences.length + 1,
        subject_template: "",
        body_template: "",
        delay_days: 3,
      },
    ]);
  };

  const removeEmailSequence = (index: number) => {
    setEmailSequences(emailSequences.filter((_, i) => i !== index));
  };

  const updateEmailSequence = (
    index: number,
    field: keyof EmailSequence,
    value: string | number
  ) => {
    const updated = [...emailSequences];
    updated[index] = { ...updated[index], [field]: value };
    setEmailSequences(updated);
  };

  const canUpdate = 
    campaignName.trim() !== "" &&
    selectedContacts.length > 0 &&
    emailSequences.length > 0 &&
    emailSequences.every((seq) => seq.subject_template && seq.body_template);

  if (campaignLoading) {
    return <div className="container mx-auto p-6">Laden...</div>;
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/outreach-campaigns/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kampagne bearbeiten</h1>
          <p className="text-muted-foreground mt-1">
            Bearbeite deine Outreach Kampagne
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>So funktioniert die AI-Personalisierung</AlertTitle>
        <AlertDescription>
          Du gibst die Richtung vor (Ton, Struktur, Thema), die AI macht den Rest:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Passt Betreff und Nachricht an Position und Branche an</li>
            <li>Integriert deine Zielgruppe und den Call-to-Action</li>
            <li>Ersetzt Variablen wie {`{{first_name}}`} automatisch</li>
            <li>Optimiert die Ansprache für jeden Kontakt individuell</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Kampagnen Details */}
        <Card>
          <CardHeader>
            <CardTitle>Kampagnen-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kampagnenname *</Label>
              <Input
                id="name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="z.B. Q1 Sales Outreach"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
                placeholder="Optionale Beschreibung der Kampagne"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-audience">Zielgruppe</Label>
              <Textarea
                id="target-audience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="z.B. CTOs in Tech-Startups mit 50-200 Mitarbeitern"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Beschreibe deine Zielgruppe für bessere AI-Personalisierung
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired-cta">Gewünschter Call-to-Action</Label>
              <Input
                id="desired-cta"
                value={desiredCta}
                onChange={(e) => setDesiredCta(e.target.value)}
                placeholder="z.B. Demo-Call buchen, Whitepaper downloaden"
              />
              <p className="text-xs text-muted-foreground">
                Was soll der Empfänger nach der E-Mail tun?
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-instructions">AI Anweisungen (Optional)</Label>
              <Textarea
                id="ai-instructions"
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                placeholder="Zusätzliche Anweisungen für die AI-Personalisierung"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Erweitere die Standard-Anweisungen falls nötig
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kontakt-Auswahl */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakte auswählen *</CardTitle>
            <CardDescription>
              {selectedContacts.length} von {contacts?.length || 0} Kontakten ausgewählt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {contacts?.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => toggleContact(contact.id)}
                >
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => toggleContact(contact.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                  </div>
                  {contact.position && (
                    <Badge variant="outline">{contact.position}</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* E-Mail Sequenzen */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>E-Mail Sequenzen *</CardTitle>
                <CardDescription>
                  Definiere die Richtung für deine E-Mails. Die AI verwendet diese als Grundlage und personalisiert sie automatisch für jeden Kontakt basierend auf Zielgruppe, CTA und Kontaktdaten.
                </CardDescription>
              </div>
              <Button onClick={addEmailSequence} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                E-Mail hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {emailSequences.map((sequence, index) => (
              <div key={index}>
                {index > 0 && <Separator className="my-6" />}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">E-Mail #{sequence.sequence_number}</h4>
                    {emailSequences.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmailSequence(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  {index > 0 && (
                    <div className="space-y-2">
                      <Label>Verzögerung (Tage)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={sequence.delay_days}
                        onChange={(e) =>
                          updateEmailSequence(
                            index,
                            "delay_days",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Betreff-Guideline *</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Die AI verwendet diese Vorlage als Grundlage und passt sie automatisch an jeden Kontakt an. Du kannst Variablen wie {`{{first_name}}`} oder {`{{position}}`} verwenden.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      value={sequence.subject_template}
                      onChange={(e) =>
                        updateEmailSequence(index, "subject_template", e.target.value)
                      }
                      placeholder={`z.B. Hallo {{first_name}}, gemeinsam zum Erfolg?`}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Die AI personalisiert diesen Betreff basierend auf Zielgruppe, Position und CTA
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Nachricht-Guideline *</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Gib den Ton und die Struktur vor. Die AI passt die Nachricht automatisch an Position, Unternehmen und Branche des Kontakts an.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      value={sequence.body_template}
                      onChange={(e) =>
                        updateEmailSequence(index, "body_template", e.target.value)
                      }
                      placeholder={`z.B. Sehr geehrte(r) {{first_name}},

ich habe gesehen, dass Sie als {{position}} tätig sind. Gemeinsam mit Ihrem Team bei {{company}} könnten wir...

Beste Grüße`}
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Die AI erweitert und personalisiert diese Vorlage unter Verwendung von Zielgruppe, CTA und Kontaktdaten
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(`/admin/outreach-campaigns/${id}`)}>
            Abbrechen
          </Button>
          <Button
            onClick={() => updateCampaignMutation.mutate()}
            disabled={!canUpdate || updateCampaignMutation.isPending}
          >
            {updateCampaignMutation.isPending ? "Speichere..." : "Änderungen speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}