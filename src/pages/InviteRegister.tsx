import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Building2, CheckCircle, AlertCircle, UserPlus } from "lucide-react";

const InviteRegister = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
          title: "Ungültiger Einladungslink",
          description: "Der Einladungslink ist nicht gültig oder unvollständig.",
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
            title: "Einladung nicht gefunden",
            description: "Die Einladung ist abgelaufen oder wurde bereits verwendet.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        setInvitation(inviteData);
      } catch (error) {
        console.error('Error validating invitation:', error);
        toast({
          title: "Fehler",
          description: "Es gab ein Problem beim Überprüfen der Einladung.",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [inviteToken, inviteEmail, navigate, toast]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Fehlende Daten",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwort-Fehler",
        description: "Die Passwörter stimmen nicht überein.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
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

        // Assign user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'user'
          });

        if (roleError) throw roleError;

        // Mark invitation as accepted
        const { error: inviteError } = await supabase
          .from('invitations')
          .update({ status: 'accepted' })
          .eq('id', inviteToken);

        if (inviteError) throw inviteError;

        toast({
          title: "Registrierung erfolgreich!",
          description: "Ihr Konto wurde erstellt. Sie werden automatisch angemeldet.",
        });

        // Redirect to dashboard
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message || "Es gab ein Problem bei der Registrierung.",
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
          <CardTitle className="text-2xl">Willkommen bei HejTalent</CardTitle>
          <CardDescription>
            Sie wurden zu <strong>{invitation?.companies?.name}</strong> eingeladen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Einladung verifiziert</span>
            </div>
            <div className="text-sm text-blue-600 mt-1">
              E-Mail: {inviteEmail}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                  placeholder="Ihr Vorname"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                  placeholder="Ihr Nachname"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                placeholder="Mindestens 6 Zeichen"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                placeholder="Passwort wiederholen"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={registering}
            >
              {registering ? 'Konto wird erstellt...' : 'Konto erstellen'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Bereits ein Konto? <a href="/auth" className="text-primary hover:underline">Hier anmelden</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegister;