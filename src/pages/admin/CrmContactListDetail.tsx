import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Trash2, Mail, Phone, Building2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ContactListMember {
  id: string;
  contact_id: string;
  added_at: string;
  crm_contacts: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    position: string | null;
    status: string;
    crm_companies: {
      name: string;
    } | null;
  };
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  status: string;
  crm_companies: {
    name: string;
  } | null;
}

const CrmContactListDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addContactSearchTerm, setAddContactSearchTerm] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [removeContactId, setRemoveContactId] = useState<string | null>(null);

  // Fetch list details
  const { data: listData } = useQuery({
    queryKey: ['contactList', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_lists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch list members
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['contactListMembers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_list_members')
        .select(`
          *,
          crm_contacts (
            *,
            crm_companies (
              name
            )
          )
        `)
        .eq('list_id', id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data as unknown as ContactListMember[];
    },
    enabled: !!id,
  });

  // Fetch all contacts (for adding to list)
  const { data: allContacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['allContacts', addContactSearchTerm],
    queryFn: async () => {
      let query = supabase
        .from('crm_contacts')
        .select(`
          *,
          crm_companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (addContactSearchTerm) {
        query = query.or(`first_name.ilike.%${addContactSearchTerm}%,last_name.ilike.%${addContactSearchTerm}%,email.ilike.%${addContactSearchTerm}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data as unknown as Contact[];
    },
    enabled: isAddDialogOpen,
  });

  // Get contact IDs already in the list
  const existingContactIds = members?.map(m => m.contact_id) || [];

  // Filter available contacts (not already in list)
  const availableContacts = allContacts?.filter(
    contact => !existingContactIds.includes(contact.id)
  );

  // Add contacts mutation
  const addContactsMutation = useMutation({
    mutationFn: async (contactIds: string[]) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const members = contactIds.map(contactId => ({
        list_id: id,
        contact_id: contactId,
        added_by: userData.user.id,
      }));

      const { error } = await supabase
        .from('crm_contact_list_members')
        .insert(members);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactListMembers', id] });
      queryClient.invalidateQueries({ queryKey: ['contactLists'] });
      toast({
        title: "Kontakte hinzugefügt",
        description: `${selectedContactIds.length} Kontakt(e) wurden zur Liste hinzugefügt.`,
      });
      setIsAddDialogOpen(false);
      setSelectedContactIds([]);
      setAddContactSearchTerm("");
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Kontakte konnten nicht hinzugefügt werden.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Remove contact mutation
  const removeContactMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('crm_contact_list_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactListMembers', id] });
      queryClient.invalidateQueries({ queryKey: ['contactLists'] });
      toast({
        title: "Kontakt entfernt",
        description: "Der Kontakt wurde aus der Liste entfernt.",
      });
      setRemoveContactId(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Der Kontakt konnte nicht entfernt werden.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleAddContacts = () => {
    if (selectedContactIds.length === 0) {
      toast({
        title: "Keine Auswahl",
        description: "Bitte wählen Sie mindestens einen Kontakt aus.",
        variant: "destructive",
      });
      return;
    }
    addContactsMutation.mutate(selectedContactIds);
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const filteredMembers = members?.filter(member => {
    const contact = member.crm_contacts;
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.first_name.toLowerCase().includes(searchLower) ||
      contact.last_name.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.crm_companies?.name.toLowerCase().includes(searchLower)
    );
  });

  if (!listData) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/crm/contact-lists')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/crm/contact-lists')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{listData.name}</h1>
            <p className="text-muted-foreground">
              {listData.description || "Keine Beschreibung"}
            </p>
          </div>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Kontakte hinzufügen
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kontakte durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{members?.length || 0}</div>
          <p className="text-sm text-muted-foreground">Kontakte in dieser Liste</p>
        </CardContent>
      </Card>

      {/* Members List */}
      {isLoadingMembers ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMembers && filteredMembers.length > 0 ? (
        <div className="space-y-4">
          {filteredMembers.map((member) => {
            const contact = member.crm_contacts;
            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {contact.first_name} {contact.last_name}
                        </h3>
                        <Badge variant="secondary">{contact.status}</Badge>
                      </div>
                      
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        {contact.position && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{contact.position}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        {contact.crm_companies && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>{contact.crm_companies.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/crm/contacts/${contact.id}`)}
                      >
                        Anzeigen
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveContactId(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Keine Kontakte gefunden</p>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Keine Kontakte entsprechen Ihrer Suche."
                : "Fügen Sie Kontakte zu dieser Liste hinzu, um zu starten."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Kontakte hinzufügen
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Contacts Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Kontakte zur Liste hinzufügen</DialogTitle>
            <DialogDescription>
              Wählen Sie die Kontakte aus, die Sie zur Liste "{listData.name}" hinzufügen möchten
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kontakte suchen..."
                value={addContactSearchTerm}
                onChange={(e) => setAddContactSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected count */}
            {selectedContactIds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedContactIds.length} Kontakt(e) ausgewählt
              </div>
            )}

            {/* Contacts List */}
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
              {isLoadingContacts ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : availableContacts && availableContacts.length > 0 ? (
                availableContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => toggleContactSelection(contact.id)}
                  >
                    <Checkbox
                      checked={selectedContactIds.includes(contact.id)}
                      onCheckedChange={() => toggleContactSelection(contact.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {contact.email || "Keine E-Mail"}
                        {contact.crm_companies && ` • ${contact.crm_companies.name}`}
                      </div>
                    </div>
                    <Badge variant="secondary">{contact.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {addContactSearchTerm
                    ? "Keine Kontakte gefunden"
                    : "Alle Kontakte sind bereits in dieser Liste"}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setSelectedContactIds([]);
              setAddContactSearchTerm("");
            }}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAddContacts} 
              disabled={selectedContactIds.length === 0 || addContactsMutation.isPending}
            >
              {addContactsMutation.isPending 
                ? "Füge hinzu..." 
                : `${selectedContactIds.length} Kontakt(e) hinzufügen`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Contact Dialog */}
      <AlertDialog open={!!removeContactId} onOpenChange={() => setRemoveContactId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kontakt aus Liste entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Kontakt wird nur aus dieser Liste entfernt und bleibt im CRM erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeContactId && removeContactMutation.mutate(removeContactId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Entfernen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CrmContactListDetail;
