import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Key, CheckCircle } from 'lucide-react';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Überprüfe ob ein gültiger Token vorhanden ist
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    if (token && type === 'recovery') {
      setIsValidToken(true);
    } else {
      toast({
        title: "Ungültiger Link",
        description: "Dieser Passwort-Reset-Link ist ungültig oder abgelaufen.",
        variant: "destructive",
      });
      // Redirect zu Login nach 3 Sekunden
      setTimeout(() => navigate('/auth'), 3000);
    }
  }, [searchParams, navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwörter stimmen nicht überein",
        description: "Bitte stellen Sie sicher, dass beide Passwörter identisch sind.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Passwort erfolgreich geändert",
        description: "Ihr Passwort wurde erfolgreich aktualisiert. Sie können sich jetzt mit dem neuen Passwort anmelden.",
      });

      // Redirect zum Dashboard oder Login nach 3 Sekunden
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 3000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Fehler beim Zurücksetzen",
        description: error.message || "Das Passwort konnte nicht zurückgesetzt werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src={hejTalentLogo} 
              alt="Hej Talent Logo" 
              className="h-12 mx-auto mb-4"
            />
            <CardTitle className="text-2xl font-bold text-red-600">Ungültiger Link</CardTitle>
            <CardDescription>
              Dieser Passwort-Reset-Link ist ungültig oder abgelaufen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img 
              src={hejTalentLogo} 
              alt="Hej Talent Logo" 
              className="h-12 mx-auto mb-4"
            />
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Passwort geändert!</CardTitle>
            <CardDescription>
              Ihr Passwort wurde erfolgreich aktualisiert. Sie werden automatisch weitergeleitet...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/app/dashboard')} 
              className="w-full"
            >
              Zum Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <img 
            src={hejTalentLogo} 
            alt="Hej Talent Logo" 
            className="h-16 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Passwort zurücksetzen
          </h1>
          <p className="text-gray-600">
            Geben Sie Ihr neues Passwort ein
          </p>
        </div>

        {/* Reset Form */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Neues Passwort festlegen
            </CardTitle>
            <CardDescription>
              Wählen Sie ein sicheres Passwort mit mindestens 6 Zeichen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Neues Passwort</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mindestens 6 Zeichen"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Passwort wiederholen"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Wird gespeichert..." : "Passwort aktualisieren"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;