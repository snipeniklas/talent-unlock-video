import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface EmailSequence {
  sequence_number: number;
  subject_template: string;
  body_template: string;
  delay_days: number;
}

export default function OutreachCampaignNew() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [desiredCta, setDesiredCta] = useState("");
  const [aiInstructions, setAiInstructions] = useState(
    `Personalisiere die E-Mail basierend auf den Kontaktinformationen.
  
Wichtig:
- Verwende einen professionellen, aber freundlichen Ton
- Gehe auf die Position und das Unternehmen des Empfängers ein
- Stelle einen klaren Bezug zur Zielgruppe her
- Integriere den Call-to-Action natürlich in die E-Mail`
  );
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [emailSequences, setEmailSequences] = useState<EmailSequence[]>([
    {
      sequence_number: 1,
      subject_template: "",
      body_template: "",
      delay_days: 0,
    },
  ]);

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

  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("outreach_campaigns")
        .insert({
          name: campaignName,
          description: campaignDescription,
          ai_instructions: aiInstructions,
          target_audience: targetAudience,
          desired_cta: desiredCta,
          created_by: user.id,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Add contacts to campaign
      const contactsToAdd = selectedContacts.map((contactId) => ({
        campaign_id: campaign.id,
        contact_id: contactId,
      }));

      const { error: contactsError } = await supabase
        .from("outreach_campaign_contacts")
        .insert(contactsToAdd);

      if (contactsError) throw contactsError;

      // Add email sequences
      const sequencesToAdd = emailSequences.map((seq) => ({
        campaign_id: campaign.id,
        ...seq,
      }));

      const { error: sequencesError } = await supabase
        .from("outreach_email_sequences")
        .insert(sequencesToAdd);

      if (sequencesError) throw sequencesError;

      return campaign;
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaigns"] });
      toast({
        title: "Kampagne erstellt",
        description: "Die Kampagne wurde erfolgreich erstellt.",
      });
      navigate(`/admin/outreach-campaigns/${campaign.id}`);
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

  const canCreate = 
    campaignName.trim() !== "" &&
    selectedContacts.length > 0 &&
    emailSequences.length > 0 &&
    emailSequences.every((seq) => seq.subject_template && seq.body_template);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/outreach-campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Neue Outreach Kampagne</h1>
          <p className="text-muted-foreground mt-1">
            Erstelle eine automatisierte E-Mail-Kampagne mit AI-Personalisierung
          </p>
        </div>
      </div>

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
                  Definiere die E-Mails, die automatisch gesendet werden
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
                    <Label>Betreff *</Label>
                    <Input
                      value={sequence.subject_template}
                      onChange={(e) =>
                        updateEmailSequence(index, "subject_template", e.target.value)
                      }
                      placeholder="Verwende {{first_name}}, {{company}} etc. für Variablen"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nachricht *</Label>
                    <Textarea
                      value={sequence.body_template}
                      onChange={(e) =>
                        updateEmailSequence(index, "body_template", e.target.value)
                      }
                      placeholder="Die AI wird diese Vorlage personalisieren..."
                      rows={6}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/outreach-campaigns")}>
            Abbrechen
          </Button>
          <Button
            onClick={() => createCampaignMutation.mutate()}
            disabled={!canCreate || createCampaignMutation.isPending}
          >
            {createCampaignMutation.isPending ? "Erstelle..." : "Kampagne erstellen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
