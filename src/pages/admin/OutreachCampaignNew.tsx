import { useState, useEffect, useMemo } from "react";
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
import { ArrowLeft, Info, Mail, List as ListIcon, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [aiInstructions, setAiInstructions] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [contactSelectionMode, setContactSelectionMode] = useState<"lists" | "contacts">("lists");
  const [numFollowUps, setNumFollowUps] = useState(1);
  const [emailSequences, setEmailSequences] = useState<EmailSequence[]>([]);

  // Helper functions for default prompts
  const getDefaultSubjectPrompt = (sequenceNum: number): string => {
    if (sequenceNum === 1) {
      return "Schreibe einen professionellen, neugierig machenden Betreff für eine erste Kontaktaufnahme. Beziehe dich auf die Position des Kontakts und schaffe einen direkten Bezug zur Zielgruppe. Maximal 60 Zeichen.";
    } else if (sequenceNum === 2) {
      return "Schreibe einen freundlichen Follow-Up Betreff, der auf die erste E-Mail Bezug nimmt, ohne aufdringlich zu wirken. Maximal 60 Zeichen.";
    } else if (sequenceNum === 3) {
      return "Schreibe einen prägnanten, wertorientierten Betreff für ein zweites Follow-Up. Maximal 60 Zeichen.";
    } else {
      return `Schreibe einen direkten Betreff für Follow-Up #${sequenceNum - 1}. Maximal 60 Zeichen.`;
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

  // Generate email sequences dynamically based on number of follow-ups
  useEffect(() => {
    const totalEmails = numFollowUps + 1;
    
    if (emailSequences.length !== totalEmails) {
      const newSequences = Array.from({ length: totalEmails }, (_, i) => ({
        sequence_number: i + 1,
        subject_template: getDefaultSubjectPrompt(i + 1),
        body_template: getDefaultBodyPrompt(i + 1),
        delay_days: i === 0 ? 0 : 3,
      }));
      setEmailSequences(newSequences);
    }
  }, [numFollowUps]);

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

  const { data: contactLists } = useQuery({
    queryKey: ["contact-lists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contact_lists")
        .select(`
          *,
          crm_contact_list_members!inner (
            contact_id
          )
        `);
      
      if (error) throw error;
      
      return data?.map(list => ({
        ...list,
        contact_count: Array.isArray(list.crm_contact_list_members) ? list.crm_contact_list_members.length : 0,
        contact_ids: Array.isArray(list.crm_contact_list_members) 
          ? list.crm_contact_list_members.map((m: any) => m.contact_id) 
          : []
      }));
    },
  });

  // All contacts from selected lists
  const contactsFromLists = useMemo(() => {
    if (!contactLists || !selectedLists.length) return [];
    
    const allIds = selectedLists.flatMap(listId => {
      const list = contactLists.find(l => l.id === listId);
      return list?.contact_ids || [];
    });
    
    return Array.from(new Set(allIds));
  }, [contactLists, selectedLists]);

  // Final contacts (Lists + Individual, without duplicates)
  const finalContactIds = useMemo(() => {
    const combined = [...contactsFromLists, ...selectedContacts];
    return Array.from(new Set(combined));
  }, [contactsFromLists, selectedContacts]);

  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht angemeldet");

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

      const contactsToAdd = finalContactIds.map((contactId) => ({
        campaign_id: campaign.id,
        contact_id: contactId,
        next_send_date: new Date().toISOString(),
        next_sequence_number: 1,
        status: 'pending',
      }));

      const { error: contactsError } = await supabase
        .from("outreach_campaign_contacts")
        .insert(contactsToAdd);

      if (contactsError) throw contactsError;

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

  const toggleList = (listId: string) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const updateEmailSequence = (
    sequenceNumber: number,
    field: keyof EmailSequence,
    value: string | number
  ) => {
    const updated = emailSequences.map((seq) =>
      seq.sequence_number === sequenceNumber ? { ...seq, [field]: value } : seq
    );
    setEmailSequences(updated);
  };

  const canCreate = 
    campaignName.trim() !== "" &&
    finalContactIds.length > 0 &&
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

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Die KI schreibt jede E-Mail komplett neu basierend auf deinen Prompts (Anweisungen). 
          Du gibst an, <strong>WIE</strong> die E-Mail geschrieben werden soll (Ton, Struktur, Länge) - 
          die KI erstellt dann eine individuelle, personalisierte E-Mail für jeden Kontakt basierend auf Position, Unternehmen und Research-Daten.
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="desired-cta">Gewünschter Call-to-Action</Label>
              <Input
                id="desired-cta"
                value={desiredCta}
                onChange={(e) => setDesiredCta(e.target.value)}
                placeholder="z.B. Demo-Call buchen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-instructions">AI Anweisungen (Optional)</Label>
              <Textarea
                id="ai-instructions"
                value={aiInstructions}
                onChange={(e) => setAiInstructions(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zielgruppe auswählen *</CardTitle>
            <CardDescription>
              Wählen Sie Listen oder einzelne Kontakte aus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={contactSelectionMode} onValueChange={(v) => setContactSelectionMode(v as "lists" | "contacts")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lists" className="gap-2">
                  <ListIcon className="h-4 w-4" />
                  Listen
                </TabsTrigger>
                <TabsTrigger value="contacts" className="gap-2">
                  <Users className="h-4 w-4" />
                  Einzelkontakte
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lists" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Alle Kontakte aus gewählten Listen werden zur Kampagne hinzugefügt
                </p>
                
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
                  {contactLists && contactLists.length > 0 ? (
                    contactLists.map(list => (
                      <div
                        key={list.id}
                        onClick={() => toggleList(list.id)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={selectedLists.includes(list.id)}
                            onCheckedChange={() => toggleList(list.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{list.name}</p>
                            {list.description && (
                              <p className="text-sm text-muted-foreground truncate">
                                {list.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {list.contact_count} Kontakte
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ListIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                      <p>Keine Listen vorhanden</p>
                      <Button
                        variant="link"
                        onClick={() => navigate('/admin/crm/contact-lists')}
                        className="mt-2"
                      >
                        Erste Liste erstellen
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">
                    📋 {selectedLists.length} Listen ausgewählt
                  </p>
                  <p className="text-sm text-muted-foreground">
                    = {contactsFromLists.length} Kontakte
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Wählen Sie individuelle Kontakte zusätzlich zu den Listen aus
                </p>

                <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
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

                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">
                    👤 {selectedContacts.length} Einzelkontakte ausgewählt
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="font-semibold mb-2">Kampagnen-Reichweite:</p>
              <div className="space-y-1 text-sm">
                <p>📋 {selectedLists.length} Listen = {contactsFromLists.length} Kontakte</p>
                <p>👤 {selectedContacts.length} Einzelkontakte</p>
                <div className="pt-2 border-t mt-2">
                  <p className="font-semibold text-base">
                    = {finalContactIds.length} Kontakte gesamt
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (Duplikate wurden entfernt)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-Mail Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="num-followups">Anzahl Follow-Ups</Label>
              <Select
                value={numFollowUps.toString()}
                onValueChange={(value) => setNumFollowUps(parseInt(value))}
              >
                <SelectTrigger id="num-followups">
                  <SelectValue placeholder="Wähle Anzahl..." />
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
              <p className="text-sm text-muted-foreground mt-2">
                ℹ️ Du erstellst damit {numFollowUps + 1} E-Mail{numFollowUps + 1 > 1 ? 's' : ''} insgesamt:
                1 initiale E-Mail{numFollowUps > 0 ? ` + ${numFollowUps} Follow-Up${numFollowUps > 1 ? 's' : ''}` : ''}
              </p>
            </div>

            <Separator />

            {emailSequences.map((sequence) => (
              <Card key={sequence.sequence_number}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    E-Mail #{sequence.sequence_number}
                    {sequence.sequence_number === 1 ? " (Initiale E-Mail)" : ` (${sequence.sequence_number - 1}. Follow-Up)`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sequence.sequence_number > 1 && (
                    <div>
                      <Label htmlFor={`delay-${sequence.sequence_number}`}>
                        Verzögerung (Tage nach vorheriger E-Mail)
                      </Label>
                      <Input
                        id={`delay-${sequence.sequence_number}`}
                        type="number"
                        min="1"
                        value={sequence.delay_days}
                        onChange={(e) =>
                          updateEmailSequence(
                            sequence.sequence_number,
                            "delay_days",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor={`subject-${sequence.sequence_number}`}>
                        Betreff-Prompt *
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Gib der KI Anweisungen, WIE der Betreff geschrieben werden soll. Die KI generiert dann einen komplett neuen, individuellen Betreff für jeden Kontakt basierend auf Position, Unternehmen und Zielgruppe.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id={`subject-${sequence.sequence_number}`}
                      placeholder="z.B. Schreibe einen professionellen, neugierig machenden Betreff..."
                      value={sequence.subject_template}
                      onChange={(e) =>
                        updateEmailSequence(
                          sequence.sequence_number,
                          "subject_template",
                          e.target.value
                        )
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor={`body-${sequence.sequence_number}`}>
                        E-Mail-Prompt *
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Beschreibe, WIE die E-Mail geschrieben werden soll (Ton, Struktur, Fokus, Länge). Die KI erstellt dann eine komplett neue, personalisierte E-Mail für jeden Kontakt. Keine Variablen nötig - die KI macht alles.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Textarea
                      id={`body-${sequence.sequence_number}`}
                      placeholder="z.B. Schreibe eine professionelle E-Mail mit persönlicher Ansprache..."
                      value={sequence.body_template}
                      onChange={(e) =>
                        updateEmailSequence(
                          sequence.sequence_number,
                          "body_template",
                          e.target.value
                        )
                      }
                      rows={8}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

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
