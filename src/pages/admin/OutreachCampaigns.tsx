import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OutreachCampaigns() {
  const navigate = useNavigate();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["outreach-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_campaigns")
        .select(`
          *,
          outreach_campaign_contacts(count)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Aktiv";
      case "paused":
        return "Pausiert";
      case "completed":
        return "Abgeschlossen";
      default:
        return "Entwurf";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Outreach Kampagnen</h1>
          <p className="text-muted-foreground mt-2">
            Automatisierte E-Mail-Kampagnen mit AI-Personalisierung
          </p>
        </div>
        <Button onClick={() => navigate("/admin/outreach-campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Kampagne
        </Button>
      </div>

      {isLoading ? (
        <div>Laden...</div>
      ) : campaigns?.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Noch keine Kampagnen vorhanden.
            </p>
            <Button onClick={() => navigate("/admin/outreach-campaigns/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Kampagne erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns?.map((campaign) => (
            <Card
              key={campaign.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/admin/outreach-campaigns/${campaign.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>{campaign.name}</CardTitle>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {getStatusText(campaign.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    {campaign.outreach_campaign_contacts?.[0]?.count || 0} Kontakte
                  </span>
                  <span>
                    Erstellt am{" "}
                    {new Date(campaign.created_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
