import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, Plus, Upload, LayoutGrid, Table as TableIcon, Eye, Edit, Calendar, UserPlus, PhoneCall, CheckCircle2, FileText, Handshake, Trophy, XCircle, GripVertical, List as ListIcon, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/i18n";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CsvImportDialog from "@/components/CsvImportDialog";
import { DataTable, ColumnDef, FilterDef } from "@/components/DataTable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CrmContact {
  id: string;
  user_id?: string; // Link to registered user
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<"kanban" | "table">("kanban");
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [draggedContact, setDraggedContact] = useState<CrmContact | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [addToListDialogOpen, setAddToListDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<CrmContact | null>(null);
  const scrollRefs = useRef<{ [key: string]: number }>({});
  const scrollContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts with React Query
  const { data: contacts = [], isLoading: loading } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  const { data: contactLists } = useQuery({
    queryKey: ['contact-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_lists')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const addContactsToListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const members = selectedContactIds.map(contactId => ({
        list_id: listId,
        contact_id: contactId,
      }));
      
      const { error } = await supabase
        .from('crm_contact_list_members')
        .insert(members);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Kontakte hinzugefügt",
        description: `${selectedContactIds.length} Kontakte wurden zur Liste hinzugefügt.`,
      });
      setSelectedContactIds([]);
      setAddToListDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Kontakt gelöscht",
        description: "Der Kontakt wurde erfolgreich gelöscht.",
      });
      setDeleteDialogOpen(false);
      setContactToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Der Kontakt konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      console.error("Error deleting contact:", error);
    },
  });

  const handleDeleteContact = (contact: CrmContact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete.id);
    }
  };

  // Save scroll positions before re-render
  useLayoutEffect(() => {
    if (activeView === 'kanban') {
      statusOrder.forEach(status => {
        const container = scrollContainerRefs.current[status];
        if (container) {
          scrollRefs.current[status] = container.scrollTop;
        }
      });
    }
  });

  // Restore scroll positions after re-render
  useLayoutEffect(() => {
    if (activeView === 'kanban' && contacts.length > 0) {
      statusOrder.forEach(status => {
        const container = scrollContainerRefs.current[status];
        const savedScroll = scrollRefs.current[status];
        if (container && savedScroll !== undefined) {
          container.scrollTop = savedScroll;
        }
      });
    }
  }, [contacts, activeView]);

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

  const handleDragStart = (e: React.DragEvent, contact: CrmContact) => {
    setDraggedContact(contact);
    e.dataTransfer.effectAllowed = "move";
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedContact(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedContact || draggedContact.status === newStatus) return;
    
    const oldStatus = draggedContact.status;
    const contactId = draggedContact.id;
    
    // Optimistic Update
    queryClient.setQueryData(['crm-contacts'], (old: CrmContact[] = []) => 
      old.map(c => c.id === contactId ? { ...c, status: newStatus } : c)
    );
    
    // Database Update
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .update({ status: newStatus })
        .eq('id', contactId);
      
      if (error) throw error;
    } catch (error) {
      console.error(error);
      // Rollback on error
      queryClient.setQueryData(['crm-contacts'], (old: CrmContact[] = []) => 
        old.map(c => c.id === contactId ? { ...c, status: oldStatus } : c)
      );
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
    
    setDragOverStatus(null);
  };

  const ContactCard = ({ contact }: { contact: CrmContact }) => (
    <Card 
      draggable
      onDragStart={(e) => handleDragStart(e, contact)}
      onDragEnd={handleDragEnd}
      className="hover:shadow-md transition-all duration-200 mb-2 cursor-grab active:cursor-grabbing group border hover:border-primary/50 bg-card"
    >
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                {contact.first_name} {contact.last_name}
              </p>
              {contact.position && (
                <p className="text-xs text-muted-foreground truncate">{contact.position}</p>
              )}
            </div>
          </div>
          <Badge className={`text-xs px-1.5 py-0 flex-shrink-0 ${getPriorityColor(contact.priority)}`} variant="outline">
            {contact.priority === 'high' ? '!' : contact.priority === 'medium' ? '•' : '·'}
          </Badge>
          {contact.user_id && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-green-100 text-green-700 border-green-300">
                    <User className="h-3 w-3" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Registrierter Benutzer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {(contact.email || contact.phone) && (
          <p className="text-xs text-muted-foreground truncate pl-6">
            {contact.email || contact.phone}
          </p>
        )}
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 pl-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/crm/contacts/${contact.id}`);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/crm/contacts/${contact.id}/edit`);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 text-destructive hover:text-destructive" 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteContact(contact);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const KanbanView = () => {
    const statusInfo = {
      new: { icon: UserPlus, color: 'border-blue-200 bg-blue-50/50', iconColor: 'text-blue-600' },
      contacted: { icon: PhoneCall, color: 'border-yellow-200 bg-yellow-50/50', iconColor: 'text-yellow-600' },
      qualified: { icon: CheckCircle2, color: 'border-green-200 bg-green-50/50', iconColor: 'text-green-600' },
      proposal: { icon: FileText, color: 'border-purple-200 bg-purple-50/50', iconColor: 'text-purple-600' },
      negotiation: { icon: Handshake, color: 'border-orange-200 bg-orange-50/50', iconColor: 'text-orange-600' },
      won: { icon: Trophy, color: 'border-green-300 bg-green-100/50', iconColor: 'text-green-700' },
      lost: { icon: XCircle, color: 'border-red-200 bg-red-50/50', iconColor: 'text-red-600' }
    };

    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max" style={{ width: 'max-content' }}>
          {statusOrder.map(status => {
            const statusContacts = filteredContacts.filter(contact => contact.status === status);
            const info = statusInfo[status as keyof typeof statusInfo];
            const IconComponent = info.icon;
            
            return (
              <div key={status} className="flex-shrink-0 w-72">
                <div 
                  onDragOver={(e) => handleDragOver(e, status)}
                  onDragLeave={() => setDragOverStatus(null)}
                  onDrop={(e) => handleDrop(e, status)}
                  className={`rounded-lg border-2 transition-all duration-200 h-full shadow-sm ${
                    dragOverStatus === status 
                      ? 'border-primary bg-primary/5 scale-[1.02]' 
                      : info.color
                  }`}
                >
                  <div className="p-3 border-b sticky top-0 bg-card/95 backdrop-blur-sm z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 ${info.iconColor}`} />
                        <h3 className="font-semibold text-sm">
                          {t(`crm.contacts.status.${status}`)}
                        </h3>
                      </div>
                      <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {statusContacts.length}
                      </Badge>
                    </div>
                  </div>
                  
                  <div 
                    ref={(el) => scrollContainerRefs.current[status] = el}
                    className="p-3 space-y-2 min-h-[500px] max-h-[70vh] overflow-y-auto"
                    onScroll={(e) => {
                      const target = e.target as HTMLDivElement;
                      scrollRefs.current[status] = target.scrollTop;
                    }}
                  >
                    {statusContacts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <IconComponent className={`h-8 w-8 mx-auto mb-2 opacity-20 ${info.iconColor}`} />
                        <p className="text-xs">{t('crm.kanban.noContacts', 'Keine Kontakte')}</p>
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
  };

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
      id: "is_registered",
      header: "Registriert",
      accessorKey: "user_id",
      sortable: true,
      filterable: true,
      defaultVisible: true,
      cell: (value) => value ? (
        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
          <User className="h-3 w-3 mr-1" />
          Ja
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          Nein
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteContact(row)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Löschen
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
      id: "is_registered",
      label: "Registrierungsstatus",
      options: [
        { label: "Registriert", value: "true" },
        { label: "Nicht registriert", value: "false" },
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
            onImportComplete={() => queryClient.invalidateQueries({ queryKey: ['crm-contacts'] })}
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

        <TabsContent value="table" className="mt-0 space-y-4">
          {selectedContactIds.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <p className="font-medium">
                {selectedContactIds.length} Kontakte ausgewählt
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAddToListDialogOpen(true)}
                >
                  <ListIcon className="h-4 w-4 mr-2" />
                  Zu Liste hinzufügen
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedContactIds([])}
                >
                  Auswahl aufheben
                </Button>
              </div>
            </div>
          )}

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

      <Dialog open={addToListDialogOpen} onOpenChange={setAddToListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zu Liste hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {contactLists && contactLists.length > 0 ? (
              contactLists.map(list => (
                <div
                  key={list.id}
                  onClick={() => addContactsToListMutation.mutate(list.id)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <p className="font-medium">{list.name}</p>
                  {list.description && (
                    <p className="text-xs text-muted-foreground">{list.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ListIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Keine Listen verfügbar</p>
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
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kontakt löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Kontakt "{contactToDelete?.first_name} {contactToDelete?.last_name}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
