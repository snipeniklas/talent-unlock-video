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
import { ArrowLeft, Mail, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [numFollowUps, setNumFollowUps] = useState(1);
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

  // Helper functions for default prompts
  const getDefaultSubjectPrompt = (sequenceNum: number): string => {
    if (sequenceNum === 1) {
      return "Schreibe einen professionellen, neugierig machenden Betreff für eine erste Kontaktaufnahme. Beziehe dich auf die Position des Kontakts und schaffe einen direkten Bezug zur Zielgruppe. Maximal 60 Zeichen.";
    } else if (sequenceNum === 2) {
      return "Schreibe einen freundlichen Follow-Up Betreff, der auf die erste E-Mail Bezug nimmt, ohne aufdringlich zu wirken. Maximal 60 Zeichen.";
    } else if (sequenceNum === 3) {
      return "Schreibe einen prägnanten, wertorientierten Betreff für ein zweites Follow-Up.";
    } else {
      return `Schreibe einen direkten Betreff für Follow-Up #${sequenceNum - 1}.`;
    }
  };

  const getDefaultBodyPrompt = (sequenceNum: number): string => {
    if (sequenceNum === 1) {
      return `Schreibe eine professionelle, aber persönliche E-Mail für eine erste Kontaktaufnahme.

Wichtige Elemente:
- Persönliche Ansprache basierend auf Position und Unternehmen
- Relevanter Aufhänger (z.B. aktuelle Entwicklungen in der Branche)
- Klarer Mehrwert für den Empfänger
- Direkter, aber unaufdringlicher Call-to-Action
- Professioneller, freundlicher Ton

Länge: 100-150 Wörter. Nutze HTML-Formatierung mit <p> Tags.`;
    } else if (sequenceNum === 2) {
      return `Schreibe ein höfliches Follow-Up zur ersten E-Mail.

Wichtige Elemente:
- Kurzer Verweis auf die erste Nachricht
- Zusätzlicher Mehrwert oder neue Perspektive
- Verständnis für Zeitknappheit zeigen
- Erneuter, sanfter Call-to-Action

Länge: 80-120 Wörter. Ton: Freundlich, nicht pushy.`;
    } else if (sequenceNum === 3) {
      return `Verfasse ein kurzes, wertorientiertes zweites Follow-Up.

Wichtige Elemente:
- Sehr kurz und auf den Punkt (max. 80 Wörter)
- Konkreter Mehrwert im Fokus
- Alternative CTA anbieten (z.B. kurzer Call vs. Ressource)
- Professionell, aber mit leichter Dringlichkeit`;
    } else {
      return `Verfasse ein sehr kurzes, finales Follow-Up #${sequenceNum - 1}.

Wichtig:
- Maximal 60 Wörter
- Klare Deadline oder letzte Chance kommunizieren
- Professionell bleiben`;
    }
  };

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
      
      // Set email sequences and derive numFollowUps
      const sequences = campaign.outreach_email_sequences?.map((seq: any) => ({
        id: seq.id,
        sequence_number: seq.sequence_number,
        subject_template: seq.subject_template,
        body_template: seq.body_template,
        delay_days: seq.delay_days,
      })) || [];
      
      if (sequences.length > 0) {
        setEmailSequences(sequences);
        setNumFollowUps(sequences.length - 1); // -1 because first email is not a follow-up
      }
    }
  }, [campaign]);

  // Generate email sequences based on numFollowUps
  useEffect(() => {
    const totalEmails = numFollowUps + 1; // +1 for initial email
    
    if (emailSequences.length !== totalEmails) {
      const newSequences = Array.from({ length: totalEmails }, (_, i) => {
        const existing = emailSequences[i];
        return existing || {
          sequence_number: i + 1,
          subject_template: getDefaultSubjectPrompt(i + 1),
          body_template: getDefaultBodyPrompt(i + 1),
          delay_days: i === 0 ? 0 : 3,
        };
      });
      setEmailSequences(newSequences);
    }
  }, [numFollowUps]);

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
        <Mail className="h-4 w-4" />
        <AlertTitle>AI-Generierung</AlertTitle>
        <AlertDescription>
          Die E-Mails werden von KI komplett neu geschrieben basierend auf Ihren Prompts, Kontaktdaten und Firmenprofil.
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

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>E-Mail Konfiguration</CardTitle>
            <CardDescription>
              Konfigurieren Sie die E-Mail-Sequenzen für diese Kampagne
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="numFollowUps">Anzahl Follow-Ups</Label>
              <Select
                value={numFollowUps.toString()}
                onValueChange={(value) => setNumFollowUps(parseInt(value))}
              >
                <SelectTrigger id="numFollowUps">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 (nur initiale E-Mail)</SelectItem>
                  <SelectItem value="1">1 Follow-Up</SelectItem>
                  <SelectItem value="2">2 Follow-Ups</SelectItem>
                  <SelectItem value="3">3 Follow-Ups</SelectItem>
                  <SelectItem value="4">4 Follow-Ups</SelectItem>
                  <SelectItem value="5">5 Follow-Ups</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                ℹ️ Du erstellst damit {numFollowUps + 1} E-Mail{numFollowUps + 1 > 1 ? 's' : ''} insgesamt
              </p>
            </div>

            <Separator />

            {emailSequences.map((sequence, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">
                    E-Mail #{sequence.sequence_number}
                    {index === 0 ? ' (Initiale E-Mail)' : ` (${index}. Follow-Up)`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {index > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor={`delay-${index}`}>Verzögerung (Tage)</Label>
                      <Input
                        id={`delay-${index}`}
                        type="number"
                        min="1"
                        value={sequence.delay_days}
                        onChange={(e) => updateEmailSequence(index, 'delay_days', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor={`subject-${index}`}>
                      Betreff-Prompt *
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="inline-block w-4 h-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Gib der KI Anweisungen, WIE der Betreff geschrieben werden soll.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Textarea
                      id={`subject-${index}`}
                      value={sequence.subject_template}
                      onChange={(e) => updateEmailSequence(index, 'subject_template', e.target.value)}
                      className="min-h-[80px]"
                      placeholder="z.B. Schreibe einen professionellen Betreff..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`body-${index}`}>
                      E-Mail-Prompt *
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="inline-block w-4 h-4 ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Beschreibe, WIE die E-Mail geschrieben werden soll.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Textarea
                      id={`body-${index}`}
                      value={sequence.body_template}
                      onChange={(e) => updateEmailSequence(index, 'body_template', e.target.value)}
                      className="min-h-[200px]"
                      placeholder="z.B. Schreibe eine professionelle E-Mail..."
                    />
                  </div>
                </CardContent>
              </Card>
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