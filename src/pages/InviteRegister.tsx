import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, UserPlus } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";

const InviteRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const inviteToken = searchParams.get('token');
  const inviteEmail = searchParams.get('email');

  useEffect(() => {
    const validateInvitation = async () => {
      if (!inviteToken || !inviteEmail) {
        toast({
          title: t('auth.invite.toast.invalidLink'),
          description: t('auth.invite.toast.invalidLinkDesc'),
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      try {
        // Check if invitation exists and is valid
        const { data: inviteData, error } = await supabase
          .from('invitations')
          .select(`
            *,
            companies(name)
          `)
          .eq('id', inviteToken)
          .eq('email', inviteEmail.toLowerCase())
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !inviteData) {
          toast({
            title: t('auth.invite.toast.notFound'),
            description: t('auth.invite.toast.notFoundDesc'),
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        setInvitation(inviteData);
      } catch (error) {
        console.error('Error validating invitation:', error);
        toast({
          title: t('auth.invite.toast.validationError'),
          description: t('auth.invite.toast.validationErrorDesc'),
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [inviteToken, inviteEmail, navigate, toast, t]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: t('auth.invite.toast.missingData'),
        description: t('auth.invite.toast.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('auth.invite.toast.passwordError'),
        description: t('auth.invite.toast.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: t('auth.invite.toast.passwordTooShort'),
        description: t('auth.invite.toast.passwordTooShortDesc'),
        variant: "destructive",
      });
      return;
    }

    setRegistering(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteEmail!,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/app/dashboard`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            company_id: invitation.company_id
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile for the new user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: inviteEmail!,
            company_id: invitation.company_id
          });

        if (profileError) throw profileError;

        // Assign user role based on invitation
        const role = invitation.invited_role || 'user';
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: role
          });

        if (roleError) throw roleError;

        // Mark invitation as accepted
        const { error: inviteError } = await supabase
          .from('invitations')
          .update({ status: 'accepted' })
          .eq('id', inviteToken);

        if (inviteError) throw inviteError;

        toast({
          title: t('auth.invite.toast.success'),
          description: t('auth.invite.toast.successDesc'),
        });

        // Redirect to dashboard
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: t('auth.invite.toast.failed'),
        description: error.message || t('auth.toast.unexpectedError'),
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">{t('auth.invite.title')}</CardTitle>
          <CardDescription>
            {t('auth.invite.invitedTo')} <strong>{invitation?.companies?.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{t('auth.invite.verified')}</span>
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {t('auth.invite.email')}: {inviteEmail}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('auth.invite.form.firstName')} *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                  placeholder={t('auth.invite.form.firstNamePlaceholder')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t('auth.invite.form.lastName')} *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                  placeholder={t('auth.invite.form.lastNamePlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">{t('auth.invite.form.password')} *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                placeholder={t('auth.invite.form.passwordPlaceholder')}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('auth.invite.form.confirmPassword')} *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                placeholder={t('auth.invite.form.confirmPlaceholder')}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={registering}
            >
              {registering ? t('auth.invite.form.submitting') : t('auth.invite.form.submit')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.invite.hasAccount')} <a href="/auth" className="text-primary hover:underline">{t('auth.invite.loginHere')}</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegister;