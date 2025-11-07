import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Building2, UserPlus, Lock, Mail, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from '@/i18n/i18n';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id: string;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
  email: string;
  website: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const Settings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    website: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin' | 'company_admin' | 'resource_manager'>('user');
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Fetch current user and profile
  const { data: currentUser } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      return { 
        user, 
        profile,
        isCompanyAdmin: userRoles?.some((ur: any) => ur.role === 'company_admin'),
        isAdmin: userRoles?.some((ur: any) => ur.role === 'admin'),
        roles: userRoles?.map((ur: any) => ur.role) || []
      };
    }
  });

  // Fetch company data
  const { data: company } = useQuery({
    queryKey: ['userCompany'],
    queryFn: async () => {
      if (!currentUser?.profile?.company_id) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', currentUser.profile.company_id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.profile?.company_id
  });

  // Fetch company invitations
  const { data: invitations = [] } = useQuery({
    queryKey: ['companyInvitations'],
    queryFn: async () => {
      if (!currentUser?.profile?.company_id) return [];
      
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('company_id', currentUser.profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!currentUser?.profile?.company_id && (currentUser?.isCompanyAdmin || currentUser?.isAdmin)
  });


  // Set initial data when loaded
  useEffect(() => {
    if (company) {
      setCompanyData({
        name: company.name || '',
        email: company.email || '',
        website: company.website || ''
      });
    }
    if (currentUser?.isCompanyAdmin) {
      setIsCompanyAdmin(true);
    }
    if (currentUser?.isAdmin) {
      setIsAdmin(true);
    }
  }, [company, currentUser]);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error(t('app.settings.toasts.error', 'Fehler'));
      }
      if (passwordData.newPassword.length < 6) {
        throw new Error(t('app.settings.password.min', 'Mindestens 6 Zeichen'));
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: t('app.settings.toasts.passwordChanged.title', 'Passwort geändert'),
        description: t('app.settings.toasts.passwordChanged.desc', 'Ihr Passwort wurde erfolgreich geändert.'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('app.settings.toasts.error', 'Fehler'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.profile?.company_id) throw new Error(t('app.searchRequests.toasts.errorCompany', 'Keine Firma gefunden. Bitte kontaktieren Sie den Support.'));
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: companyData.name,
          email: companyData.email,
          website: companyData.website
        })
        .eq('id', currentUser.profile.company_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCompany'] });
      toast({
        title: t('app.settings.company.updatedTitle', 'Unternehmen aktualisiert'),
        description: t('app.settings.company.updatedDesc', 'Die Unternehmensdaten wurden erfolgreich aktualisiert.'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('app.settings.toasts.error', 'Fehler'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async () => {
      if (!inviteEmail.trim()) throw new Error(t('app.settings.team.invite.email', 'E-Mail-Adresse') + ' ' + t('app.settings.toasts.error', 'Fehler'));
      if (!currentUser?.profile?.company_id) throw new Error(t('app.searchRequests.toasts.errorCompany', 'Keine Firma gefunden. Bitte kontaktieren Sie den Support.'));

      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          email: inviteEmail.toLowerCase().trim(),
          company_id: currentUser.profile.company_id,
          invited_by: currentUser.user.id,
          invited_role: (isAdmin ? inviteRole : 'user') as any, // Type will be updated after migration
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const { data, error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteEmail.toLowerCase().trim(),
          companyName: company?.name || t('app.settings.company.title', 'Unternehmensdaten'),
          inviteToken: invitation.id
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return { invitation, emailData: data };
    },
    onSuccess: (data) => {
      setInviteEmail('');
      setInviteRole('user');
      queryClient.invalidateQueries({ queryKey: ['companyInvitations'] });
      
      const successMessage = data.emailData?.inviteUrl 
        ? `Invitation created! Link: ${data.emailData.inviteUrl}`
        : t('app.settings.team.invite.sentDesc', 'Die Einladung wurde erfolgreich versendet.');
      
      toast({
        title: t('app.settings.team.invite.sentTitle', 'Einladung versendet'),
        description: successMessage,
        duration: data.emailData?.inviteUrl ? 10000 : 4000,
      });
    },
    onError: (error: any) => {
      toast({
        title: t('app.settings.toasts.error', 'Fehler'),
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete invitation mutation
  const deleteInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyInvitations'] });
      toast({
        title: t('app.settings.team.invite.deletedTitle', 'Einladung gelöscht'),
        description: t('app.settings.team.invite.deletedDesc', 'Die Einladung wurde erfolgreich gelöscht.'),
      });
    }
  });


  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'accepted': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getInvitationStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('app.settings.team.list.status.pending', 'Ausstehend');
      case 'accepted': return t('app.settings.team.list.status.accepted', 'Angenommen');
      case 'expired': return t('app.settings.team.list.status.expired', 'Abgelaufen');
      default: return status;
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            <span className="text-primary">{t('app.settings.title', 'Einstellungen')}</span>
          </h1>
          <p className="text-muted-foreground">
            {t('app.settings.subtitle', 'Verwalten Sie Ihr Profil, Unternehmen und Mitarbeiter')}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('app.settings.tabs.profile', 'Profil & Passwort')}
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2" disabled={!isCompanyAdmin}>
              <Building2 className="w-4 h-4" />
              {t('app.settings.tabs.company', 'Unternehmen')}
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2" disabled={!(isCompanyAdmin || isAdmin)}>
              <UserPlus className="w-4 h-4" />
              {t('app.settings.tabs.team', 'Team-Verwaltung')}
            </TabsTrigger>
          </TabsList>

          {/* Profile & Password Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('app.settings.profile.title', 'Profil-Informationen')}
                  </CardTitle>
                  <CardDescription>
                    {t('app.settings.profile.desc', 'Ihre persönlichen Informationen (nur lesbar)')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('app.settings.profile.firstName', 'Vorname')}</Label>
                      <Input value={currentUser.profile?.first_name || ''} disabled />
                    </div>
                    <div>
                      <Label>{t('app.settings.profile.lastName', 'Nachname')}</Label>
                      <Input value={currentUser.profile?.last_name || ''} disabled />
                    </div>
                  </div>
                  <div>
                    <Label>{t('app.settings.profile.email', 'E-Mail-Adresse')}</Label>
                    <Input value={currentUser.user?.email || ''} disabled />
                  </div>
                  {isCompanyAdmin && (
                    <Badge variant="secondary" className="mt-2">
                      {t('app.settings.profile.companyAdmin', 'Unternehmens-Administrator')}
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {t('app.settings.password.title', 'Passwort ändern')}
                  </CardTitle>
                  <CardDescription>
                    {t('app.settings.password.desc', 'Ändern Sie Ihr Passwort für mehr Sicherheit')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">{t('app.settings.password.new', 'Neues Passwort')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                      placeholder={t('app.settings.password.min', 'Mindestens 6 Zeichen')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">{t('app.settings.password.confirm', 'Passwort bestätigen')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                      placeholder={t('app.settings.password.confirm', 'Neues Passwort wiederholen')}
                    />
                  </div>
                  <Button 
                    onClick={() => changePasswordMutation.mutate()}
                    disabled={!passwordData.newPassword || !passwordData.confirmPassword || changePasswordMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {changePasswordMutation.isPending ? t('app.settings.password.changing', 'Wird geändert...') : t('app.settings.password.change', 'Passwort ändern')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t('app.settings.company.title', 'Unternehmensdaten')}
                </CardTitle>
                <CardDescription>
                  {t('app.settings.company.desc', 'Verwalten Sie die Informationen Ihres Unternehmens')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="companyName">{t('app.settings.company.name', 'Firmenname')}</Label>
                  <Input
                    id="companyName"
                    value={companyData.name}
                    onChange={(e) => setCompanyData(prev => ({...prev, name: e.target.value}))}
                    placeholder={t('app.settings.company.name', 'Name Ihres Unternehmens')}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">{t('app.settings.company.email', 'Firmen-E-Mail')}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyData.email}
                    onChange={(e) => setCompanyData(prev => ({...prev, email: e.target.value}))}
                    placeholder="kontakt@unternehmen.de"
                  />
                </div>
                <div>
                  <Label htmlFor="companyWebsite">{t('app.settings.company.website', 'Website')}</Label>
                  <Input
                    id="companyWebsite"
                    value={companyData.website}
                    onChange={(e) => setCompanyData(prev => ({...prev, website: e.target.value}))}
                    placeholder="https://www.unternehmen.de"
                  />
                </div>
                <Button 
                  onClick={() => updateCompanyMutation.mutate()}
                  disabled={updateCompanyMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updateCompanyMutation.isPending ? t('app.settings.company.saving', 'Wird gespeichert...') : t('app.settings.company.save', 'Änderungen speichern')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Management Tab */}
          <TabsContent value="team">
            <div className="grid gap-6">
              {/* Send Invitation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    {t('app.settings.team.invite.title', 'Mitarbeiter einladen')}
                  </CardTitle>
                  <CardDescription>
                    {t('app.settings.team.invite.desc', 'Laden Sie neue Mitarbeiter zu Ihrem Unternehmen ein')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="inviteEmail">{t('app.settings.team.invite.email', 'E-Mail-Adresse')}</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="mitarbeiter@beispiel.de"
                    />
                  </div>
                  
                  {/* Role selector - only show for admins */}
                  {isAdmin && (
                    <div>
                      <Label htmlFor="inviteRole">{t('app.settings.team.invite.role', 'Rolle')}</Label>
                      <Select value={inviteRole} onValueChange={(value: 'user' | 'admin' | 'company_admin' | 'resource_manager') => setInviteRole(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('app.settings.team.invite.role', 'Rolle auswählen')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">{t('app.settings.team.roles.user', 'Benutzer')}</SelectItem>
                          <SelectItem value="company_admin">{t('app.settings.team.roles.company_admin', 'Unternehmens-Administrator')}</SelectItem>
                          <SelectItem value="resource_manager">{t('app.settings.team.roles.resource_manager', 'Ressourcen-Manager')}</SelectItem>
                          <SelectItem value="admin">{t('app.settings.team.roles.admin', 'Administrator')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button 
                    onClick={() => sendInvitationMutation.mutate()}
                    disabled={!inviteEmail.trim() || sendInvitationMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {sendInvitationMutation.isPending ? t('app.settings.team.invite.sending', 'Wird versendet...') : t('app.settings.team.invite.send', 'Einladung senden')}
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Invitations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    {t('app.settings.team.list.title', 'Gesendete Einladungen')}
                  </CardTitle>
                  <CardDescription>
                    {t('app.settings.team.list.desc', 'Übersicht über alle gesendeten Einladungen')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('app.settings.team.list.none', 'Noch keine Einladungen versendet')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invitations.map((invitation: any) => (
                        <div key={invitation.id} className="flex items-center justify_between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{invitation.email}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('app.settings.team.list.sentOn', 'Gesendet am')} {new Date(invitation.created_at).toLocaleDateString('de-DE')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t('app.settings.team.list.expires', 'Läuft ab am')} {new Date(invitation.expires_at).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getInvitationStatusColor(invitation.status)}>
                              {getInvitationStatusText(invitation.status)}
                            </Badge>
                            {invitation.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteInvitationMutation.mutate(invitation.id)}
                                disabled={deleteInvitationMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;