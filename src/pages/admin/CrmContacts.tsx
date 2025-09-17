import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Search, Edit, Eye, LayoutGrid, List, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/i18n";
import CsvImportDialog from "@/components/CsvImportDialog";

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
  const [activeView, setActiveView] = useState("kanban");
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
    <Card className="hover:shadow-md transition-shadow mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {contact.first_name} {contact.last_name}
            </CardTitle>
            {contact.position && (
              <CardDescription>{contact.position}</CardDescription>
            )}
          </div>
          <div className="flex gap-1 flex-col">
            <Badge className={getStatusColor(contact.status)}>
              {t(`crm.contacts.status.${contact.status}`)}
            </Badge>
            <Badge className={getPriorityColor(contact.priority)} variant="outline">
              {t(`crm.contacts.priority.${contact.priority}`)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contact.email && (
          <p className="text-sm text-muted-foreground">✉️ {contact.email}</p>
        )}
        {contact.phone && (
          <p className="text-sm text-muted-foreground">📞 {contact.phone}</p>
        )}
        {contact.department && (
          <p className="text-sm text-muted-foreground">🏢 {contact.department}</p>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/crm/contacts/${contact.id}`)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('common.actions.view')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/crm/contacts/${contact.id}/edit`)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            {t('common.actions.edit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const KanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {statusOrder.map(status => {
        const statusContacts = filteredContacts.filter(contact => contact.status === status);
        return (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {t(`crm.contacts.status.${status}`)}
              </h3>
              <Badge variant="outline">{statusContacts.length}</Badge>
            </div>
            <div className="space-y-4 min-h-[200px]">
              {statusContacts.map(contact => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContacts.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );

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

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`${t('common.actions.search')} ${t('crm.contacts.title')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              {t('crm.contacts.kanbanView')}
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              {t('crm.contacts.listView')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsContent value="kanban">
          <KanbanView />
        </TabsContent>
        <TabsContent value="list">
          <ListView />
        </TabsContent>
      </Tabs>

      {filteredContacts.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {searchTerm ? 'No contacts found' : 'No contacts yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first contact'}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate("/admin/crm/contacts/new")}>
              <Plus className="h-4 w-4 mr-2" />
              {t('crm.contacts.addNew')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}