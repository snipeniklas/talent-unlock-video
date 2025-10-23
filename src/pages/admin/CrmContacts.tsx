import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Plus, Upload, LayoutGrid, Table as TableIcon, Eye, Edit, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/i18n";
import CsvImportDialog from "@/components/CsvImportDialog";
import { DataTable, ColumnDef, FilterDef } from "@/components/DataTable";

interface CrmContact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  department?: string;
  status: string;
  priority: string;
  lead_source?: string;
  notes?: string;
  next_follow_up?: string;
  last_contact_date?: string;
  created_at: string;
  crm_company_id?: string;
}

const statusOrder = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];

export default function CrmContacts() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"kanban" | "table">("kanban");
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("crm_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "qualified": return "bg-purple-100 text-purple-800";
      case "proposal": return "bg-orange-100 text-orange-800";
      case "negotiation": return "bg-indigo-100 text-indigo-800";
      case "won": return "bg-green-100 text-green-800";
      case "lost": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const ContactCard = ({ contact }: { contact: CrmContact }) => (
    <Card className="hover:shadow-lg transition-all duration-200 mb-3 cursor-pointer group border hover:border-primary/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-medium group-hover:text-primary transition-colors truncate">
              {contact.first_name} {contact.last_name}
            </CardTitle>
            {contact.position && (
              <CardDescription className="text-sm mt-1 truncate">{contact.position}</CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <Badge className={`text-xs ${getPriorityColor(contact.priority)}`} variant="outline">
              {t(`crm.contacts.priority.${contact.priority}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span className="truncate">{contact.phone}</span>
          </div>
        )}
        {contact.department && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span className="truncate">{contact.department}</span>
          </div>
        )}
        
        <div className="flex gap-1 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/crm/contacts/${contact.id}`);
            }}
            className="flex-1 h-8 text-xs hover:bg-muted hover:text-foreground"
          >
            <Eye className="h-3 w-3 mr-1" />
            {t('common.actions.view')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/crm/contacts/${contact.id}/edit`)}
            }
            className="flex-1 h-8 text-xs hover:bg-muted hover:text-foreground"
          >
            <Edit className="h-3 w-3 mr-1" />
            {t('common.actions.edit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const KanbanView = () => (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max" style={{ width: 'max-content' }}>
        {statusOrder.map(status => {
          const statusContacts = filteredContacts.filter(contact => contact.status === status);
          const statusInfo = {
            new: { icon: '🆕', color: 'border-border' },
            contacted: { icon: '📞', color: 'border-border' },
            qualified: { icon: '✅', color: 'border-border' },
            proposal: { icon: '📋', color: 'border-border' },
            negotiation: { icon: '🤝', color: 'border-border' },
            won: { icon: '🎉', color: 'border-green-200 bg-green-50' },
            lost: { icon: '❌', color: 'border-red-200 bg-red-50' }
          };
          
          return (
            <div key={status} className="flex-shrink-0 w-80">
              <div className={`rounded-lg border-2 bg-card ${statusInfo[status as keyof typeof statusInfo]?.color || 'border-border'} h-full shadow-sm`}>
                <div className="p-4 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{statusInfo[status as keyof typeof statusInfo]?.icon}</span>
                      <div>
                        <h3 className="font-semibold text-base text-foreground">
                          {t(`crm.contacts.status.${status}`)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {statusContacts.length} {t('crm.kanban.contactsCount', 'contacts')}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-medium">
                      {statusContacts.length}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-3 min-h-[500px] max-h-[70vh] overflow-y-auto">
                  {statusContacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2 opacity-50">📝</div>
                      <p className="text-sm">{t('crm.kanban.noContacts', 'No contacts in this stage')}</p>
                    </div>
                  ) : (
                    statusContacts.map((contact) => (
                      <div key={contact.id} className="animate-fade-in">
                        <ContactCard contact={contact} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Column definitions for table view
  const columns: ColumnDef<CrmContact>[] = [
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      sortable: true,
      defaultVisible: true,
      cell: (value, row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      id: "position",
      header: "Position",
      accessorKey: "position",
      sortable: true,
      defaultVisible: true,
      cell: (value) => value || "-",
    },
    {
      id: "department",
      header: "Abteilung",
      accessorKey: "department",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      cell: (value) => value || "-",
    },
    {
      id: "email",
      header: "E-Mail",
      accessorKey: "email",
      sortable: true,
      defaultVisible: true,
      cell: (value) =>
        value ? (
          <a
            href={`mailto:${value}`}
            className="flex items-center gap-1 text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3 w-3" />
            {value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      id: "phone",
      header: "Telefon",
      accessorKey: "phone",
      sortable: false,
      defaultVisible: false,
      cell: (value) =>
        value ? (
          <a
            href={`tel:${value}`}
            className="flex items-center gap-1 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3 w-3" />
            {value}
          </a>
        ) : (
          "-"
        ),
    },
    {
      id: "mobile",
      header: "Mobil",
      accessorKey: "mobile",
      sortable: false,
      defaultVisible: false,
      cell: (value) =>
        value ? (
          <a
            href={`tel:${value}`}
            className="flex items-center gap-1 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3 w-3" />
            {value}
          </a>
        ) : (
          "-"
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
          {value === "new" && "Neu"}
          {value === "contacted" && "Kontaktiert"}
          {value === "qualified" && "Qualifiziert"}
          {value === "proposal" && "Angebot"}
          {value === "negotiation" && "Verhandlung"}
          {value === "won" && "Gewonnen"}
          {value === "lost" && "Verloren"}
        </Badge>
      ),
    },
    {
      id: "priority",
      header: "Priorität",
      accessorKey: "priority",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      cell: (value) => (
        <Badge className={getPriorityColor(value)}>
          {value === "high" && "Hoch"}
          {value === "medium" && "Mittel"}
          {value === "low" && "Niedrig"}
        </Badge>
      ),
    },
    {
      id: "lead_source",
      header: "Lead-Quelle",
      accessorKey: "lead_source",
      sortable: true,
      filterable: true,
      defaultVisible: false,
      cell: (value) => value || "-",
    },
    {
      id: "last_contact_date",
      header: "Letzter Kontakt",
      accessorKey: "last_contact_date",
      sortable: true,
      defaultVisible: false,
      cell: (value) => (value ? new Date(value).toLocaleDateString("de-DE") : "-"),
    },
    {
      id: "next_follow_up",
      header: "Nächstes Follow-up",
      accessorKey: "next_follow_up",
      sortable: true,
      defaultVisible: true,
      cell: (value) =>
        value ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {new Date(value).toLocaleDateString("de-DE")}
          </div>
        ) : (
          "-"
        ),
    },
    {
      id: "created_at",
      header: "Erstellt",
      accessorKey: "created_at",
      sortable: true,
      defaultVisible: false,
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
            onClick={() => navigate(`/admin/crm/contacts/${row.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ansehen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/crm/contacts/${row.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Bearbeiten
          </Button>
        </div>
      ),
    },
  ];

  // Filter definitions
  const uniqueDepartments = Array.from(new Set(contacts.map((c) => c.department).filter(Boolean)));
  const uniqueLeadSources = Array.from(new Set(contacts.map((c) => c.lead_source).filter(Boolean)));

  const filters: FilterDef[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Neu", value: "new" },
        { label: "Kontaktiert", value: "contacted" },
        { label: "Qualifiziert", value: "qualified" },
        { label: "Angebot", value: "proposal" },
        { label: "Verhandlung", value: "negotiation" },
        { label: "Gewonnen", value: "won" },
        { label: "Verloren", value: "lost" },
      ],
    },
    {
      id: "priority",
      label: "Priorität",
      options: [
        { label: "Hoch", value: "high" },
        { label: "Mittel", value: "medium" },
        { label: "Niedrig", value: "low" },
      ],
    },
    {
      id: "department",
      label: "Abteilung",
      options: uniqueDepartments.map((dept) => ({
        label: dept!,
        value: dept!,
      })),
    },
    {
      id: "lead_source",
      label: "Lead-Quelle",
      options: uniqueLeadSources.map((source) => ({
        label: source!,
        value: source!,
      })),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('crm.contacts.title')}</h1>
          <p className="text-muted-foreground">{t('crm.contacts.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <CsvImportDialog
            open={csvDialogOpen}
            onOpenChange={setCsvDialogOpen}
            type="contacts"
            onImportComplete={fetchContacts}
          />
          <Button variant="outline" onClick={() => setCsvDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            CSV Import
          </Button>
          <Button onClick={() => navigate("/admin/crm/contacts/new")}>
            <Plus className="h-4 w-4 mr-2" />
            {t('crm.contacts.addNew')}
          </Button>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "kanban" | "table")}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Tabelle
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="mt-0">
          <div className="mb-6">
            <Input
              placeholder="Kontakte suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <KanbanView />
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <DataTable
            data={contacts}
            columns={columns}
            filters={filters}
            searchKey="first_name"
            searchPlaceholder="Kontakte suchen..."
            onRowClick={(row) => navigate(`/admin/crm/contacts/${row.id}`)}
            storageKey="crm-contacts"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
