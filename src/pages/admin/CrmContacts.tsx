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
    <Card className="hover:shadow-lg transition-all duration-200 mb-3 cursor-pointer group border-l-4 border-l-muted hover:border-l-primary">
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
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="truncate">{contact.phone}</span>
          </div>
        )}
        {contact.department && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
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
            className="flex-1 h-8 text-xs hover:bg-primary/10 hover:text-primary"
          >
            <Eye className="h-3 w-3 mr-1" />
            {t('common.actions.view')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/crm/contacts/${contact.id}/edit`);
            }}
            className="flex-1 h-8 text-xs hover:bg-primary/10 hover:text-primary"
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
            new: { color: 'bg-blue-50 border-blue-200', badgeColor: 'bg-blue-500', icon: '🆕' },
            contacted: { color: 'bg-yellow-50 border-yellow-200', badgeColor: 'bg-yellow-500', icon: '📞' },
            qualified: { color: 'bg-purple-50 border-purple-200', badgeColor: 'bg-purple-500', icon: '✅' },
            proposal: { color: 'bg-orange-50 border-orange-200', badgeColor: 'bg-orange-500', icon: '📋' },
            negotiation: { color: 'bg-indigo-50 border-indigo-200', badgeColor: 'bg-indigo-500', icon: '🤝' },
            won: { color: 'bg-green-50 border-green-200', badgeColor: 'bg-green-500', icon: '🎉' },
            lost: { color: 'bg-red-50 border-red-200', badgeColor: 'bg-red-500', icon: '❌' }
          };
          
          return (
            <div key={status} className="flex-shrink-0 w-80">
              <div className={`rounded-lg border-2 ${statusInfo[status as keyof typeof statusInfo]?.color || 'bg-gray-50 border-gray-200'} h-full`}>
                {/* Column Header */}
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{statusInfo[status as keyof typeof statusInfo]?.icon}</span>
                      <div>
                        <h3 className="font-semibold text-base text-foreground">
                          {t(`crm.contacts.status.${status}`)}
                        </h3>
                        <p className="text-sm text-muted-foreground">{statusContacts.length} contacts</p>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full ${statusInfo[status as keyof typeof statusInfo]?.badgeColor} flex items-center justify-center text-white text-sm font-medium`}>
                      {statusContacts.length}
                    </div>
                  </div>
                </div>
                
                {/* Cards Container */}
                <div className="p-4 space-y-3 min-h-[500px] max-h-[70vh] overflow-y-auto">
                  {statusContacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2 opacity-50">📝</div>
                      <p className="text-sm">No contacts in this stage</p>
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

  const ListView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredContacts.map(contact => (
        <div key={contact.id} className="animate-fade-in">
          <ContactCard contact={contact} />
        </div>
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
          <TabsList className="grid grid-cols-2 w-64">
            <TabsTrigger value="kanban" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">{t('crm.contacts.kanbanView')}</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">{t('crm.contacts.listView')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="mt-6">
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsContent value="kanban" className="mt-0">
            <KanbanView />
          </TabsContent>
          <TabsContent value="list" className="mt-0">
            <ListView />
          </TabsContent>
        </Tabs>
      </div>

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