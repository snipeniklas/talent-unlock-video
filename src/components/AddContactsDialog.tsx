import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/i18n";

interface AddContactsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listName: string;
  campaignId: string;
  existingContactIds: string[];
  onContactsAdded: () => void;
}

export default function AddContactsDialog({
  open,
  onOpenChange,
  listId,
  listName,
  campaignId,
  existingContactIds,
  onContactsAdded,
}: AddContactsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Fetch all CRM contacts
  const { data: allContacts, isLoading } = useQuery({
    queryKey: ["crm-contacts-for-campaign"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .select(`
          id,
          first_name,
          last_name,
          email,
          position,
          crm_company_id,
          crm_companies(name)
        `)
        .order("last_name", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Filter out existing contacts and apply search
  const availableContacts = useMemo(() => {
    if (!allContacts) return [];
    
    // Filter out contacts already in the campaign
    let filtered = allContacts.filter(
      (contact) => !existingContactIds.includes(contact.id)
    );

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((contact) => {
        const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
        const email = contact.email?.toLowerCase() || "";
        const position = contact.position?.toLowerCase() || "";
        const company = (contact.crm_companies as any)?.name?.toLowerCase() || "";
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          position.includes(query) ||
          company.includes(query)
        );
      });
    }

    return filtered;
  }, [allContacts, existingContactIds, searchQuery]);

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const toggleAll = () => {
    if (selectedContactIds.length === availableContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(availableContacts.map((c) => c.id));
    }
  };

  const addContactsMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Add contacts to the contact list
      const listMembers = selectedContactIds.map((contactId) => ({
        list_id: listId,
        contact_id: contactId,
        added_by: user.id,
      }));

      const { error } = await supabase
        .from("crm_contact_list_members")
        .insert(listMembers);

      if (error) throw error;

      return selectedContactIds.length;
    },
    onSuccess: (count) => {
      toast({
        title: t("outreach.campaigns.addContactsDialog.toast.success"),
        description: t("outreach.campaigns.addContactsDialog.toast.successDescription").replace("{{count}}", String(count)),
      });
      setSelectedContactIds([]);
      setSearchQuery("");
      onOpenChange(false);
      onContactsAdded();
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", campaignId] });
    },
    onError: (error: any) => {
      toast({
        title: t("outreach.campaigns.addContactsDialog.toast.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedContactIds([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("outreach.campaigns.addContactsDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("outreach.campaigns.addContactsDialog.description")}
            {listName && (
              <Badge variant="secondary" className="ml-2">
                {listName}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("outreach.campaigns.addContactsDialog.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Contact List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : availableContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {existingContactIds.length > 0 && allContacts?.length === existingContactIds.length
                ? t("outreach.campaigns.addContactsDialog.allContactsAdded")
                : t("outreach.campaigns.addContactsDialog.noContacts")}
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between px-2 py-1 border-b">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedContactIds.length === availableContacts.length && availableContacts.length > 0}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    {t("outreach.campaigns.addContactsDialog.selectAll")}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {availableContacts.length} {t("outreach.campaigns.addContactsDialog.available")}
                </span>
              </div>

              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-2 space-y-1">
                  {availableContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleContact(contact.id)}
                    >
                      <Checkbox
                        checked={selectedContactIds.includes(contact.id)}
                        onCheckedChange={() => toggleContact(contact.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(contact.first_name, contact.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {contact.first_name} {contact.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {contact.email || t("outreach.campaigns.addContactsDialog.noEmail")}
                        </div>
                      </div>
                      {contact.position && (
                        <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {contact.position}
                        </div>
                      )}
                      {(contact.crm_companies as any)?.name && (
                        <Badge variant="outline" className="text-xs truncate max-w-[100px]">
                          {(contact.crm_companies as any).name}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedContactIds.length > 0 && (
              <span>
                {t("outreach.campaigns.addContactsDialog.selected").replace("{{count}}", String(selectedContactIds.length))}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => addContactsMutation.mutate()}
              disabled={selectedContactIds.length === 0 || addContactsMutation.isPending}
            >
              {addContactsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {selectedContactIds.length === 1
                ? t("outreach.campaigns.addContactsDialog.addButtonSingle")
                : t("outreach.campaigns.addContactsDialog.addButton").replace("{{count}}", String(selectedContactIds.length))}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
