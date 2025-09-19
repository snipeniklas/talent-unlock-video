import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, companyFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(id, name)
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Rollen separat laden
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Rollen zu Profilen zuordnen
      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        user_roles: (roles || []).filter(role => role.user_id === profile.user_id).map(role => ({ role: role.role }))
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Fehler beim Laden der Benutzer",
        description: "Die Benutzerliste konnte nicht geladen werden.",
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
        .order('name');

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
      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: email,
      });

      if (error) throw error;

      toast({
        title: "Passwort-Reset gesendet",
        description: `Ein Passwort-Reset Link wurde an ${email} gesendet.`,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Fehler beim Passwort-Reset",
        description: "Der Passwort-Reset konnte nicht gesendet werden.",
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
    return "user";
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "destructive",
      company_admin: "default", 
      user: "secondary"
    };
    return colors[role as keyof typeof colors] || "secondary";
  };

  const getRoleText = (role: string) => {
    const texts = {
      admin: "Hej Talent Admin",
      company_admin: "Unternehmens-Admin",
      user: "Benutzer"
    };
    return texts[role as keyof typeof texts] || "Benutzer";
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('Updating role for user:', userId, 'to role:', newRole);
      
      // Aktuelle Rollen direkt aus der Datenbank laden
      const { data: currentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) throw rolesError;

      console.log('Current roles from database:', currentRoles);

      // Prüfen ob der User bereits die gewünschte Rolle hat
      const hasRole = currentRoles && currentRoles.length > 0 
        ? currentRoles.some(role => role.role === newRole)
        : false;
      
      console.log('User has role?', hasRole);

      if (hasRole) {
        toast({
          title: "Keine Änderung erforderlich",
          description: "Der Benutzer hat bereits diese Rolle.",
          variant: "default",
        });
        setEditingRole(null);
        return;
      }

      // Erst alle alten Rollen löschen (falls vorhanden)
      if (currentRoles && currentRoles.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (deleteError) throw deleteError;
        console.log('Deleted existing roles');
      }

      // Neue Rolle hinzufügen
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole as 'admin' | 'company_admin' | 'user'
        });

      if (insertError) {
        console.log('Insert error:', insertError);
        throw insertError;
      }

      console.log('Successfully inserted new role');

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
        errorMessage = "Diese Rolle ist bereits für den Benutzer vergeben.";
      }
      
      toast({
        title: "Fehler beim Aktualisieren der Rolle",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Benutzerverwaltung</h1>
          <p className="text-muted-foreground">Alle registrierten Benutzer verwalten</p>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRole(u.user_roles) === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">Hej Talent Admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unternehmens-Admins</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => getUserRole(u.user_roles) === 'company_admin').length}
            </div>
            <p className="text-xs text-muted-foreground">Unternehmens-Admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unternehmen</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">Registrierte Unternehmen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name oder E-Mail suchen..."
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
                <SelectItem value="user">Benutzer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Benutzerliste */}
      <Card>
        <CardHeader>
          <CardTitle>Benutzer ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Alle registrierten Benutzer sortiert nach Unternehmen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Keine Benutzer gefunden, die den Filterkriterien entsprechen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Benutzer</TableHead>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Registriert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const role = getUserRole(user.user_roles);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {user.first_name} {user.last_name}
                            </p>
                            {user.email && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.company ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {user.company.name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Kein Unternehmen</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleColor(role) as any}>
                            {getRoleText(role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(user.created_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">Aktiv</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingRole({ userId: user.user_id, currentRole: role })}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Rolle ändern
                            </Button>

                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => user.email && resetUserPassword(user.user_id, user.email)}
                              disabled={!user.email}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Reset PW
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <UserX className="w-3 h-3 mr-1" />
                                  Sperren
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Benutzer sperren</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Möchten Sie den Benutzer {user.first_name} {user.last_name} wirklich sperren? 
                                    Der Benutzer kann sich dann nicht mehr anmelden.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => toggleUserStatus(user.user_id, true)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Benutzer sperren
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Edit Dialog */}
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
                defaultValue={editingRole.currentRole} 
                onValueChange={(value) => setEditingRole({ ...editingRole, currentRole: value })}
              >
                <SelectTrigger id="role-select" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Benutzer</SelectItem>
                  <SelectItem value="company_admin">Unternehmens-Admin</SelectItem>
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
    </div>
  );
}