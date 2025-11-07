import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Search,
  Shield,
  ShieldOff,
  RefreshCw,
  Building2,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  UserX,
  Edit,
  Copy,
  UserCog,
  Key,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MS365ConnectButton } from "@/components/MS365ConnectButton";
import { useMS365Integration } from "@/hooks/useMS365Integration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at: string;
  company?: {
    id: string;
    name: string;
  };
  user_roles: {
    role: string;
  }[];
}

export default function AdminSettings() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [editingRole, setEditingRole] = useState<{userId: string, currentRole: string} | null>(null);
  const [resetLinkDialog, setResetLinkDialog] = useState<{email: string, link: string} | null>(null);
  const [deleteUserDialog, setDeleteUserDialog] = useState<{userId: string, email: string, name: string} | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [emailSignature, setEmailSignature] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isConnected: ms365Connected } = useMS365Integration();

  // Fetch current user for email settings
  const { data: currentUser } = useQuery({
    queryKey: ['currentAdminUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Fetch email settings
  const { data: emailSettings } = useQuery({
    queryKey: ['adminEmailSettings'],
    queryFn: async () => {
      if (!currentUser?.id) return null;
      
      const { data, error } = await supabase
        .from('user_email_settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.id
  });

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (emailSettings?.email_signature) {
      setEmailSignature(emailSettings.email_signature);
    }
  }, [emailSettings]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, companyFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Benutzerrollen für jeden Benutzer abrufen
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Rollen zu Benutzerprofilen hinzufügen
      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        user_roles: userRoles?.filter(role => role.user_id === profile.user_id) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Fehler beim Laden der Benutzer",
        description: "Die Benutzerdaten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Textsuche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Unternehmensfilter
    if (companyFilter !== "all") {
      filtered = filtered.filter(user => user.company?.id === companyFilter);
    }

    // Rollenfilter  
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => 
        user.user_roles.some(role => role.role === roleFilter)
      );
    }

    setFilteredUsers(filtered);
  };

  const resetUserPassword = async (userId: string, email: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email: email,
          requestingUserId: userData.user?.id
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Zeige den Reset-Link im Dialog an
      if (data.resetLink) {
        setResetLinkDialog({
          email: email,
          link: data.resetLink
        });
      }

      toast({
        title: "Passwort-Reset gesendet",
        description: data.message || `Ein Passwort-Reset Link wurde an ${email} gesendet.`,
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Fehler beim Passwort-Reset",
        description: error.message || "Der Passwort-Reset konnte nicht gesendet werden.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
      toast({
        title: "Link kopiert",
        description: "Der Passwort-Reset Link wurde in die Zwischenablage kopiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Kopieren",
        description: "Der Link konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Nicht authentifiziert');
      }

      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Benutzer gelöscht",
        description: "Der Benutzer wurde erfolgreich aus dem System entfernt.",
      });

      // Benutzerliste aktualisieren
      fetchUsers();
      setDeleteUserDialog(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Fehler beim Löschen",
        description: error.message || "Der Benutzer konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentlyActive: boolean) => {
    try {
      // Vereinfachte Simulation der User-Sperrung
      // In einer echten Implementierung würde man die User über die Auth API verwalten
      toast({
        title: "Funktion noch nicht implementiert",
        description: "Die User-Sperrung wird in einer zukünftigen Version verfügbar sein.",
        variant: "destructive",
      });
      
      // Alternative: User-Status in einer eigenen Tabelle verwalten
      // oder mit Supabase Row Level Security arbeiten
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Fehler",
        description: "Der Benutzerstatus konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  };

  const getUserRole = (userRoles: {role: string}[]) => {
    if (userRoles.length === 0) return "user";
    // Höchste Rolle zurückgeben
    if (userRoles.some(r => r.role === "admin")) return "admin";
    if (userRoles.some(r => r.role === "company_admin")) return "company_admin";
    if (userRoles.some(r => r.role === "resource_manager")) return "resource_manager";
    return "user";
  };

  const getRoleColor = (role: string): "default" | "destructive" | "secondary" | "outline" => {
    const colors = {
      admin: "destructive" as const,
      company_admin: "default" as const,
      resource_manager: "outline" as const,
      user: "secondary" as const
    };
    return colors[role as keyof typeof colors] || "secondary";
  };

  const getRoleText = (role: string) => {
    const texts = {
      admin: "Hej Talent Admin",
      company_admin: "Unternehmens-Admin",
      resource_manager: "Ressourcen-Manager",
      user: "Benutzer"
    };
    return texts[role as keyof typeof texts] || "Benutzer";
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('Updating role for user:', userId, 'to role:', newRole);
      
      // Alle alten Rollen löschen (sicherstellen dass die Tabelle sauber ist)
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.log('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('Deleted all existing roles for user');

      // Kurze Pause um sicherzustellen dass DELETE abgeschlossen ist
      await new Promise(resolve => setTimeout(resolve, 100));

      // Neue Rolle hinzufügen mit UPSERT
      const { error: upsertError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole as any // Type will be updated after migration
        }, {
          onConflict: 'user_id,role'
        });

      if (upsertError) {
        console.log('Upsert error:', upsertError);
        throw upsertError;
      }

      console.log('Successfully upserted new role');

      toast({
        title: "Rolle aktualisiert",
        description: "Die Benutzerrolle wurde erfolgreich geändert.",
      });

      // Benutzerliste aktualisieren
      fetchUsers();
      setEditingRole(null);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      let errorMessage = "Die Rolle konnte nicht geändert werden.";
      
      if (error.code === '23505') {
        errorMessage = "Fehler beim Zuweisen der Rolle. Bitte versuchen Sie es erneut.";
      }
      
      toast({
        title: "Fehler beim Aktualisieren der Rolle",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Update email signature mutation
  const updateEmailSignatureMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error('Nicht authentifiziert');

      const { error } = await supabase
        .from('user_email_settings')
        .upsert({
          user_id: currentUser.id,
          email_signature: emailSignature,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmailSettings'] });
      toast({
        title: 'E-Mail Signatur gespeichert',
        description: 'Ihre E-Mail Signatur wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Statistiken berechnen
  const totalUsers = users.length;
  const totalAdmins = users.filter(user => 
    user.user_roles.some(role => role.role === "admin")
  ).length;
  const totalCompanyAdmins = users.filter(user => 
    user.user_roles.some(role => role.role === "company_admin")
  ).length;
  const totalCompanies = companies.length;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Benutzerverwaltung
            </CardTitle>
            <CardDescription>
              Verwalten Sie alle Benutzer und deren Rollen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Benutzerverwaltung
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            E-Mail Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Benutzerverwaltung
              </CardTitle>
              <CardDescription>
                Verwalten Sie alle Benutzer und deren Rollen im System
              </CardDescription>
            </CardHeader>
            <CardContent>
          {/* Statistiken Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Gesamt Benutzer</span>
                </div>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-muted-foreground">Hej Talent Admins</span>
                </div>
                <p className="text-2xl font-bold">{totalAdmins}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">Unternehmens-Admins</span>
                </div>
                <p className="text-2xl font-bold">{totalCompanyAdmins}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Unternehmen</span>
                </div>
                <p className="text-2xl font-bold">{totalCompanies}</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter und Suche */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Unternehmen filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Unternehmen</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rolle filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                <SelectItem value="admin">Hej Talent Admin</SelectItem>
                <SelectItem value="company_admin">Unternehmens-Admin</SelectItem>
                <SelectItem value="resource_manager">Ressourcen-Manager</SelectItem>
                <SelectItem value="user">Benutzer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Benutzertabelle */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Unternehmen</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Keine Benutzer gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const userRole = getUserRole(user.user_roles);
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.company?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleColor(userRole)}>
                            {getRoleText(userRole)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(user.created_at).toLocaleDateString('de-DE')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Aktiv</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRole({
                                userId: user.user_id,
                                currentRole: userRole
                              })}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Rolle
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetUserPassword(user.user_id, user.email || '')}
                              className="flex items-center gap-1"
                            >
                              <Key className="h-4 w-4" />
                              Reset
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteUserDialog({
                                userId: user.user_id,
                                email: user.email || '',
                                name: `${user.first_name} ${user.last_name}`
                              })}
                              className="flex items-center gap-1 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Löschen
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rolle bearbeiten Dialog */}
      {editingRole && (
        <AlertDialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Benutzerrolle ändern</AlertDialogTitle>
              <AlertDialogDescription>
                Wählen Sie eine neue Rolle für diesen Benutzer aus.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="role-select">Neue Rolle:</Label>
              <Select 
                value={editingRole.currentRole} 
                onValueChange={(value) => setEditingRole({...editingRole, currentRole: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Benutzer</SelectItem>
                  <SelectItem value="company_admin">Unternehmens-Admin</SelectItem>
                  <SelectItem value="resource_manager">Ressourcen-Manager</SelectItem>
                  <SelectItem value="admin">Hej Talent Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateUserRole(editingRole.userId, editingRole.currentRole)}
              >
                Rolle ändern
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Benutzer löschen Dialog */}
      <AlertDialog open={!!deleteUserDialog} onOpenChange={() => setDeleteUserDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Benutzer endgültig löschen?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Sie sind dabei, den Benutzer <strong>{deleteUserDialog?.name}</strong> ({deleteUserDialog?.email}) 
                unwiderruflich aus dem System zu löschen.
              </p>
              <p className="text-destructive font-semibold">
                Diese Aktion kann nicht rückgängig gemacht werden!
              </p>
              <p>
                Folgende Daten werden gelöscht:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Benutzerprofil und Authentifizierung</li>
                <li>Alle Benutzerrollen</li>
                <li>E-Mail-Einstellungen und MS365-Verbindungen</li>
                <li>Verknüpfungen mit CRM-Kontakten werden aufgehoben</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserDialog && deleteUser(deleteUserDialog.userId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Benutzer löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Passwort-Reset Link Dialog */}
      <Dialog open={!!resetLinkDialog} onOpenChange={() => setResetLinkDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Passwort-Reset Link generiert</DialogTitle>
            <DialogDescription>
              Der Passwort-Reset Link wurde erfolgreich generiert und an {resetLinkDialog?.email} gesendet.
              Sie können den Link auch direkt kopieren und an den Benutzer weiterleiten.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-link">Passwort-Reset Link:</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="reset-link"
                  value={resetLinkDialog?.link || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => copyToClipboard(resetLinkDialog?.link || '')}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copiedToClipboard ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setResetLinkDialog(null)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Email Integration Tab */}
        <TabsContent value="email">
          <div className="grid gap-6">
            {/* MS365 Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Microsoft 365 Integration
                </CardTitle>
                <CardDescription>
                  Verbinden Sie Ihr Microsoft 365 Konto, um E-Mails automatisch mit CRM-Kontakten zu synchronisieren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {ms365Connected ? 'Verbunden' : 'Nicht verbunden'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ms365Connected 
                          ? 'Ihre E-Mails werden automatisch synchronisiert' 
                          : 'Verbinden Sie Ihr Konto, um E-Mails zu synchronisieren'}
                      </p>
                    </div>
                  </div>
                  <MS365ConnectButton />
                </div>
              </CardContent>
            </Card>

            {/* Email Signature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 h-5" />
                  E-Mail Signatur (HTML)
                </CardTitle>
                <CardDescription>
                  Definieren Sie Ihre persönliche E-Mail Signatur in HTML-Format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emailSignature">HTML Signatur</Label>
                  <Textarea
                    id="emailSignature"
                    value={emailSignature}
                    onChange={(e) => setEmailSignature(e.target.value)}
                    placeholder="<div>Mit freundlichen Grüßen,<br/>Ihr Name</div>"
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Verwenden Sie HTML-Tags für die Formatierung. Beispiel: &lt;strong&gt;Fett&lt;/strong&gt;, &lt;br/&gt; für Zeilenumbruch
                  </p>
                </div>
                <Button 
                  onClick={() => updateEmailSignatureMutation.mutate()}
                  disabled={updateEmailSignatureMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updateEmailSignatureMutation.isPending ? 'Wird gespeichert...' : 'Signatur speichern'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}