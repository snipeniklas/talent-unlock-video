import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Edit, Plus, Search, Users, LayoutGrid, List } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/i18n/i18n';

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
  notes?: string;
  created_at: string;
  crm_company_id?: string;
  crm_companies?: {
    name: string;
  };
}

const statusColumns = [
  { id: 'new', label: 'New', count: 0 },
  { id: 'qualified', label: 'Qualified', count: 0 },
  { id: 'proposal_sent', label: 'Proposal Sent', count: 0 },
  { id: 'negotiation', label: 'Negotiation', count: 0 },
  { id: 'won', label: 'Won', count: 0 },
  { id: 'lost', label: 'Lost', count: 0 },
  { id: 'follow_up', label: 'Follow-up', count: 0 },
];

const CrmContacts = () => {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select(`
          *,
          crm_companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('crm.contacts.deleteConfirm', 'Are you sure you want to delete this contact?'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(contacts.filter(contact => contact.id !== id));
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('crm_contacts')
        .update({ status: newStatus })
        .eq('id', contactId);

      if (error) throw error;

      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, status: newStatus } : contact
      ));

      toast({
        title: "Success",
        description: "Contact status updated",
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'won': return 'default';
      case 'qualified': case 'negotiation': return 'secondary';
      case 'proposal_sent': case 'follow_up': return 'outline';
      case 'lost': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.crm_companies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ContactCard = ({ contact }: { contact: CrmContact }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">
            {contact.first_name} {contact.last_name}
          </CardTitle>
          <CardDescription>
            {contact.position && contact.crm_companies?.name 
              ? `${contact.position} at ${contact.crm_companies.name}`
              : contact.position || contact.crm_companies?.name || 'No company'
            }
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getPriorityBadgeVariant(contact.priority)}>
            {contact.priority}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/crm/contacts/${contact.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDelete(contact.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={getStatusBadgeVariant(contact.status)}>
              {contact.status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>
              <strong>Email:</strong> {contact.email || 'Not provided'}
            </div>
            <div>
              <strong>Phone:</strong> {contact.phone || contact.mobile || 'Not provided'}
            </div>
          </div>
          {contact.notes && (
            <p className="text-sm text-muted-foreground truncate">
              <strong>Notes:</strong> {contact.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const KanbanView = () => {
    const getContactsByStatus = (status: string) => 
      filteredContacts.filter(contact => contact.status === status);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {statusColumns.map((column) => {
          const columnContacts = getContactsByStatus(column.id);
          return (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <Badge variant="secondary">{columnContacts.length}</Badge>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {columnContacts.map((contact) => (
                  <Card key={contact.id} className="p-3 cursor-move hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contact.crm_companies?.name || 'No company'}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={getPriorityBadgeVariant(contact.priority)} className="text-xs">
                          {contact.priority}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/crm/contacts/${contact.id}/edit`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('crm.contacts.title', 'Contacts')}
          </h1>
          <p className="text-muted-foreground">
            Manage your contact relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button asChild>
            <Link to="/admin/crm/contacts/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('crm.contacts.newContact', 'New Contact')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('crm.actions.search', 'Search...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('crm.contacts.noContacts', 'No contacts yet')}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('crm.contacts.createFirst', 'Create your first contact')}
            </p>
            <Button asChild>
              <Link to="/admin/crm/contacts/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('crm.contacts.newContact', 'New Contact')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'kanban' ? (
            <KanbanView />
          ) : (
            <div className="grid gap-4">
              {filteredContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CrmContacts;