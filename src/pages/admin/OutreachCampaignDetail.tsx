import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OutreachCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: campaign } = useQuery({
    queryKey: ["outreach-campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_campaigns")
        .select(`
          *,
          outreach_campaign_contacts(
            *,
            crm_contacts(*)
          ),
          outreach_email_sequences(*),
          outreach_sent_emails(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("outreach_campaigns")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
      toast({
        title: "Status aktualisiert",
        description: "Der Kampagnenstatus wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-muted";
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500";
      case "replied":
        return "bg-blue-500";
      case "bounced":
      case "failed":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  if (!campaign) return <div>Laden...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/outreach-campaigns")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground mt-1">{campaign.description}</p>
          </div>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status === "active" && "Aktiv"}
            {campaign.status === "paused" && "Pausiert"}
            {campaign.status === "completed" && "Abgeschlossen"}
            {campaign.status === "draft" && "Entwurf"}
          </Badge>
        </div>
        <div className="flex gap-2">
          {campaign.status === "draft" && (
            <Button onClick={() => updateStatusMutation.mutate("active")}>
              <Play className="h-4 w-4 mr-2" />
              Starten
            </Button>
          )}
          {campaign.status === "active" && (
            <Button onClick={() => updateStatusMutation.mutate("paused")}>
              <Pause className="h-4 w-4 mr-2" />
              Pausieren
            </Button>
          )}
          {campaign.status === "paused" && (
            <>
              <Button onClick={() => updateStatusMutation.mutate("active")}>
                <Play className="h-4 w-4 mr-2" />
                Fortsetzen
              </Button>
              <Button onClick={() => updateStatusMutation.mutate("completed")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Abschließen
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="contacts">Kontakte</TabsTrigger>
          <TabsTrigger value="sequences">E-Mail Sequenzen</TabsTrigger>
          <TabsTrigger value="sent">Versendete E-Mails</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Kontakte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaign.outreach_campaign_contacts?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Versendete E-Mails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaign.outreach_sent_emails?.length || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  E-Mail Sequenzen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaign.outreach_email_sequences?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI Anweisungen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {campaign.ai_instructions || "Keine Anweisungen definiert"}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kontakte in dieser Kampagne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {campaign.outreach_campaign_contacts?.map((cc: any) => (
                  <div
                    key={cc.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        {cc.crm_contacts.first_name} {cc.crm_contacts.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cc.crm_contacts.email}
                      </p>
                    </div>
                    <Badge className={getContactStatusColor(cc.status)}>
                      {cc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-4">
          {campaign.outreach_email_sequences?.map((sequence: any) => (
            <Card key={sequence.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>E-Mail #{sequence.sequence_number}</CardTitle>
                  {sequence.delay_days > 0 && (
                    <Badge variant="outline">+{sequence.delay_days} Tage</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Betreff:</p>
                  <p className="text-sm text-muted-foreground">
                    {sequence.subject_template}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Nachricht:</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {sequence.body_template}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Versendete E-Mails</CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.outreach_sent_emails?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine E-Mails versendet
                </p>
              ) : (
                <div className="space-y-2">
                  {campaign.outreach_sent_emails?.map((email: any) => (
                    <div
                      key={email.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{email.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          Gesendet am {new Date(email.sent_at).toLocaleString("de-DE")}
                        </p>
                      </div>
                      <Badge className={getContactStatusColor(email.status)}>
                        {email.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
