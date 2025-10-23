import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Users, Eye, Edit } from "lucide-react";
import { DataTable, ColumnDef, FilterDef } from "@/components/DataTable";

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
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "paused":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "completed":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft":
        return "Entwurf";
      case "active":
        return "Aktiv";
      case "paused":
        return "Pausiert";
      case "completed":
        return "Abgeschlossen";
      default:
        return status;
    }
  };

  // Column definitions
  const columns: ColumnDef<any>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      sortable: true,
      defaultVisible: true,
      cell: (value, row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{value}</div>
            {row.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {row.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "target_audience",
      header: "Zielgruppe",
      accessorKey: "target_audience",
      sortable: false,
      defaultVisible: false,
      cell: (value) => (
        <div className="max-w-xs truncate">{value || "-"}</div>
      ),
    },
    {
      id: "desired_cta",
      header: "Gewünschte Aktion",
      accessorKey: "desired_cta",
      sortable: false,
      defaultVisible: false,
      cell: (value) => (
        <div className="max-w-xs truncate">{value || "-"}</div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      cell: (value) => (
        <Badge className={getStatusColor(value)}>
          {getStatusText(value)}
        </Badge>
      ),
    },
    {
      id: "contacts_count",
      header: "Kontakte",
      accessorFn: (row) => row.outreach_campaign_contacts?.[0]?.count || 0,
      sortable: true,
      defaultVisible: true,
      cell: (value) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          {value || 0}
        </div>
      ),
    },
    {
      id: "created_at",
      header: "Erstellt",
      accessorKey: "created_at",
      sortable: true,
      defaultVisible: true,
      cell: (value) => new Date(value).toLocaleDateString("de-DE"),
    },
    {
      id: "actions",
      header: "Aktionen",
      sortable: false,
      defaultVisible: true,
      cell: (_, row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/outreach-campaigns/${row.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ansehen
          </Button>
          {(row.status === "paused" || row.status === "draft") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/outreach-campaigns/${row.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Bearbeiten
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Filter definitions
  const filters: FilterDef[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Entwurf", value: "draft" },
        { label: "Aktiv", value: "active" },
        { label: "Pausiert", value: "paused" },
        { label: "Abgeschlossen", value: "completed" },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Laden...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Outreach Kampagnen</h1>
        <p className="text-muted-foreground">
          Automatisierte E-Mail-Kampagnen mit AI-Personalisierung
        </p>
      </div>

      <div className="flex justify-end gap-2 mb-6">
        <Button onClick={() => navigate("/admin/outreach-campaigns/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Kampagne
        </Button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Keine Kampagnen vorhanden</h3>
          <p className="text-muted-foreground mb-4">
            Erstellen Sie Ihre erste Outreach-Kampagne
          </p>
          <Button onClick={() => navigate("/admin/outreach-campaigns/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Erstellen Sie Ihre erste Kampagne
          </Button>
        </div>
      ) : (
        <DataTable
          data={campaigns}
          columns={columns}
          filters={filters}
          searchKey="name"
          searchPlaceholder="Kampagnen suchen..."
          onRowClick={(row) => navigate(`/admin/outreach-campaigns/${row.id}`)}
          storageKey="outreach-campaigns"
        />
      )}
    </div>
  );
}
