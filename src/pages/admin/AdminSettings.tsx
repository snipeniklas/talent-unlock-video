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
import { useTranslation } from "@/i18n/i18n";
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
  const { t, lang } = useTranslation();

  // Get date locale based on language
  const getDateLocale = () => {
    switch (lang) {
      case 'de': return 'de-DE';
      case 'nl': return 'nl-NL';
      default: return 'en-US';
    }
  };

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

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        user_roles: userRoles?.filter(role => role.user_id === profile.user_id) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('adminSettings.users.toast.loadError'),
        description: t('adminSettings.users.toast.loadErrorDescription'),
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

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (companyFilter !== "all") {
      filtered = filtered.filter(user => user.company?.id === companyFilter);
    }

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

      if (data.resetLink) {
        setResetLinkDialog({
          email: email,
          link: data.resetLink
        });
      }

      toast({
        title: t('adminSettings.users.toast.passwordReset'),
        description: data.message || t('adminSettings.users.toast.passwordResetDescription').replace('{email}', email),
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: t('adminSettings.users.toast.passwordResetError'),
        description: error.message || t('adminSettings.users.toast.passwordResetErrorDescription'),
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
        title: t('adminSettings.users.toast.linkCopied'),
        description: t('adminSettings.users.toast.linkCopiedDescription'),
      });
    } catch (error) {
      toast({
        title: t('adminSettings.users.toast.copyError'),
        description: t('adminSettings.users.toast.copyErrorDescription'),
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error(t('adminSettings.users.toast.notAuthenticated'));
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
        title: t('adminSettings.users.toast.deleted'),
        description: t('adminSettings.users.toast.deletedDescription'),
      });

      fetchUsers();
      setDeleteUserDialog(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: t('adminSettings.users.toast.deleteError'),
        description: error.message || t('adminSettings.users.toast.deleteErrorDescription'),
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentlyActive: boolean) => {
    try {
      toast({
        title: t('adminSettings.users.toast.notImplemented'),
        description: t('adminSettings.users.toast.notImplementedDescription'),
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: t('adminSettings.users.toast.statusError'),
        description: t('adminSettings.users.toast.statusErrorDescription'),
        variant: "destructive",
      });
    }
  };

  const getUserRole = (userRoles: {role: string}[]) => {
    if (userRoles.length === 0) return "user";
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
    return t(`adminSettings.users.roles.${role}`, role);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log('Updating role for user:', userId, 'to role:', newRole);
      
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.log('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('Deleted all existing roles for user');

      await new Promise(resolve => setTimeout(resolve, 100));

      const { error: upsertError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole as any
        }, {
          onConflict: 'user_id,role'
        });

      if (upsertError) {
        console.log('Upsert error:', upsertError);
        throw upsertError;
      }

      console.log('Successfully upserted new role');

      toast({
        title: t('adminSettings.users.toast.roleChanged'),
        description: t('adminSettings.users.toast.roleChangedDescription'),
      });

      fetchUsers();
      setEditingRole(null);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      
      toast({
        title: t('adminSettings.users.toast.roleError'),
        description: t('adminSettings.users.toast.roleErrorDescription'),
        variant: "destructive",
      });
    }
  };

  // Update email signature mutation
  const updateEmailSignatureMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error(t('adminSettings.users.toast.notAuthenticated'));

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
        title: t('adminSettings.email.toast.saved'),
        description: t('adminSettings.email.toast.savedDescription'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('adminSettings.email.toast.error'),
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
              {t('adminSettings.users.title')}
            </CardTitle>
            <CardDescription>
              {t('adminSettings.users.subtitle')}
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
            {t('adminSettings.tabs.users')}
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            {t('adminSettings.tabs.email')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('adminSettings.users.title')}
              </CardTitle>
              <CardDescription>
                {t('adminSettings.users.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
          {/* Statistiken Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">{t('adminSettings.users.stats.totalUsers')}</span>
                </div>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-muted-foreground">{t('adminSettings.users.stats.hejTalentAdmins')}</span>
                </div>
                <p className="text-2xl font-bold">{totalAdmins}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">{t('adminSettings.users.stats.companyAdmins')}</span>
                </div>
                <p className="text-2xl font-bold">{totalCompanyAdmins}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">{t('adminSettings.users.stats.companies')}</span>
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
                placeholder={t('adminSettings.users.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('adminSettings.users.filters.filterCompany')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminSettings.users.filters.allCompanies')}</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('adminSettings.users.filters.filterRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminSettings.users.filters.allRoles')}</SelectItem>
                <SelectItem value="admin">{t('adminSettings.users.roles.admin')}</SelectItem>
                <SelectItem value="company_admin">{t('adminSettings.users.roles.company_admin')}</SelectItem>
                <SelectItem value="resource_manager">{t('adminSettings.users.roles.resource_manager')}</SelectItem>
                <SelectItem value="user">{t('adminSettings.users.roles.user')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Benutzertabelle */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('adminSettings.users.columns.name')}</TableHead>
                  <TableHead>{t('adminSettings.users.columns.email')}</TableHead>
                  <TableHead>{t('adminSettings.users.columns.company')}</TableHead>
                  <TableHead>{t('adminSettings.users.columns.role')}</TableHead>
                  <TableHead>{t('adminSettings.users.columns.registered')}</TableHead>
                  <TableHead>{t('adminSettings.users.columns.status')}</TableHead>
                  <TableHead className="text-right">{t('adminSettings.users.columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {t('adminSettings.users.search.noResults')}
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
                            {new Date(user.created_at).toLocaleDateString(getDateLocale())}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{t('adminSettings.users.status.active')}</span>
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
                              {t('adminSettings.users.actions.role')}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resetUserPassword(user.user_id, user.email || '')}
                              className="flex items-center gap-1"
                            >
                              <Key className="h-4 w-4" />
                              {t('adminSettings.users.actions.reset')}
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
                              {t('adminSettings.users.actions.delete')}
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
              <AlertDialogTitle>{t('adminSettings.users.dialog.changeRoleTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('adminSettings.users.dialog.changeRoleDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="role-select">{t('adminSettings.users.dialog.newRole')}</Label>
              <Select 
                value={editingRole.currentRole} 
                onValueChange={(value) => setEditingRole({...editingRole, currentRole: value})}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t('adminSettings.users.roles.user')}</SelectItem>
                  <SelectItem value="company_admin">{t('adminSettings.users.roles.company_admin')}</SelectItem>
                  <SelectItem value="resource_manager">{t('adminSettings.users.roles.resource_manager')}</SelectItem>
                  <SelectItem value="admin">{t('adminSettings.users.roles.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('adminSettings.users.dialog.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => updateUserRole(editingRole.userId, editingRole.currentRole)}
              >
                {t('adminSettings.users.dialog.confirm')}
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
              {t('adminSettings.users.dialog.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {t('adminSettings.users.dialog.deleteWarning')
                  .replace('{name}', deleteUserDialog?.name || '')
                  .replace('{email}', deleteUserDialog?.email || '')}
              </p>
              <p className="text-destructive font-semibold">
                {t('adminSettings.users.dialog.deleteIrreversible')}
              </p>
              <p>
                {t('adminSettings.users.dialog.deleteDataTitle')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>{t('adminSettings.users.dialog.deleteDataItems.profile')}</li>
                <li>{t('adminSettings.users.dialog.deleteDataItems.roles')}</li>
                <li>{t('adminSettings.users.dialog.deleteDataItems.emailSettings')}</li>
                <li>{t('adminSettings.users.dialog.deleteDataItems.crmLinks')}</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('adminSettings.users.dialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserDialog && deleteUser(deleteUserDialog.userId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('adminSettings.users.dialog.deleteButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Passwort-Reset Link Dialog */}
      <Dialog open={!!resetLinkDialog} onOpenChange={() => setResetLinkDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('adminSettings.users.dialog.resetTitle')}</DialogTitle>
            <DialogDescription>
              {t('adminSettings.users.dialog.resetDescription').replace('{email}', resetLinkDialog?.email || '')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reset-link">{t('adminSettings.users.dialog.resetLinkLabel')}</Label>
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
              {t('adminSettings.users.dialog.close')}
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
                  {t('adminSettings.email.ms365.title')}
                </CardTitle>
                <CardDescription>
                  {t('adminSettings.email.ms365.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {ms365Connected ? t('adminSettings.email.ms365.connected') : t('adminSettings.email.ms365.notConnected')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ms365Connected 
                          ? t('adminSettings.email.ms365.connectedDescription') 
                          : t('adminSettings.email.ms365.notConnectedDescription')}
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
                  {t('adminSettings.email.signature.title')}
                </CardTitle>
                <CardDescription>
                  {t('adminSettings.email.signature.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="emailSignature">{t('adminSettings.email.signature.label')}</Label>
                  <Textarea
                    id="emailSignature"
                    value={emailSignature}
                    onChange={(e) => setEmailSignature(e.target.value)}
                    placeholder={t('adminSettings.email.signature.placeholder')}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('adminSettings.email.signature.help')}
                  </p>
                </div>
                <Button 
                  onClick={() => updateEmailSignatureMutation.mutate()}
                  disabled={updateEmailSignatureMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updateEmailSignatureMutation.isPending ? t('adminSettings.email.savingButton') : t('adminSettings.email.saveButton')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
