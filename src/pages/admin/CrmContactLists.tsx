import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Search, Trash2, Edit, Users } from "lucide-react";
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

interface ContactList {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  contact_count?: number;
}

const CrmContactLists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<ContactList | null>(null);
  
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");

  // Fetch all contact lists with contact count
  const { data: contactLists, isLoading } = useQuery({
    queryKey: ['contactLists'],
    queryFn: async () => {
      const { data: lists, error: listsError } = await supabase
        .from('crm_contact_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (listsError) throw listsError;

      // Get contact counts for each list
      const listsWithCounts = await Promise.all(
        (lists || []).map(async (list) => {
          const { count } = await supabase
            .from('crm_contact_list_members')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id);

          return {
            ...list,
            contact_count: count || 0,
          };
        })
      );

      return listsWithCounts;
    },
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('crm_contact_lists')
        .insert({
          name: data.name,
          description: data.description,
          created_by: userData.user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactLists'] });
      toast({
        title: "Liste erstellt",
        description: "Die Kontaktliste wurde erfolgreich erstellt.",
      });
      setIsCreateDialogOpen(false);
      setNewListName("");
      setNewListDescription("");
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Liste konnte nicht erstellt werden.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Update list mutation
  const updateListMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; description: string }) => {
      const { error } = await supabase
        .from('crm_contact_lists')
        .update({
          name: data.name,
          description: data.description,
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactLists'] });
      toast({
        title: "Liste aktualisiert",
        description: "Die Kontaktliste wurde erfolgreich aktualisiert.",
      });
      setIsEditDialogOpen(false);
      setEditingList(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Liste konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('crm_contact_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactLists'] });
      toast({
        title: "Liste gelöscht",
        description: "Die Kontaktliste wurde erfolgreich gelöscht.",
      });
      setDeleteListId(null);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Die Liste konnte nicht gelöscht werden.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für die Liste ein.",
        variant: "destructive",
      });
      return;
    }
    createListMutation.mutate({ name: newListName, description: newListDescription });
  };

  const handleEditList = () => {
    if (!editingList || !editingList.name.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für die Liste ein.",
        variant: "destructive",
      });
      return;
    }
    updateListMutation.mutate({
      id: editingList.id,
      name: editingList.name,
      description: editingList.description || "",
    });
  };

  const openEditDialog = (list: ContactList) => {
    setEditingList({ ...list });
    setIsEditDialogOpen(true);
  };

  const filteredLists = contactLists?.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/crm')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kontaktlisten</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre Kontaktlisten für Outreach-Kampagnen
            </p>
          </div>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neue Liste
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Kontaktliste erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Liste für Ihre Kontakte
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="z.B. Q1 Sales Targets"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Optionale Beschreibung der Liste"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateList} disabled={createListMutation.isPending}>
                {createListMutation.isPending ? "Erstelle..." : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Listen durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lists Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : filteredLists && filteredLists.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLists.map((list) => (
            <Card key={list.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {list.description || "Keine Beschreibung"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(list)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteListId(list.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {list.contact_count} Kontakte
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/crm/contact-lists/${list.id}`)}
                  >
                    Verwalten
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Keine Listen gefunden</p>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? "Keine Listen entsprechen Ihrer Suche."
                : "Erstellen Sie Ihre erste Kontaktliste, um zu starten."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erste Liste erstellen
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liste bearbeiten</DialogTitle>
            <DialogDescription>
              Ändern Sie Name und Beschreibung der Liste
            </DialogDescription>
          </DialogHeader>
          {editingList && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editingList.name}
                  onChange={(e) => setEditingList({ ...editingList, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Beschreibung</Label>
                <Textarea
                  id="edit-description"
                  value={editingList.description || ""}
                  onChange={(e) => setEditingList({ ...editingList, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleEditList} disabled={updateListMutation.isPending}>
              {updateListMutation.isPending ? "Speichere..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteListId} onOpenChange={() => setDeleteListId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Liste löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Liste wird permanent gelöscht,
              aber die Kontakte bleiben erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteListId && deleteListMutation.mutate(deleteListId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CrmContactLists;
