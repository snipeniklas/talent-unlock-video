import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Star, Users, Shield, ArrowLeft } from 'lucide-react';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users to dashboard
        if (session?.user) {
          navigate('/app/dashboard');
        }
        
        if (loading) {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirect if already authenticated
      if (session?.user) {
        navigate('/app/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        toast({
          title: "Login fehlgeschlagen",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erfolgreich angemeldet",
          description: "Willkommen zurück!",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonalDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName && position && phoneNumber && signupEmail && signupPassword) {
      setRegistrationStep(2);
    }
  };

  const handleCompanyDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            position: position,
            phone: phoneNumber,
            company: {
              name: companyName,
              email: companyEmail,
              website: companyWebsite,
            }
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account existiert bereits",
            description: "Diese E-Mail-Adresse ist bereits registriert. Bitte loggen Sie sich ein.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registrierung fehlgeschlagen",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Registrierung erfolgreich",
          description: "Bitte prüfen Sie Ihre E-Mails zur Bestätigung.",
        });
        setRegistrationStep(1); // Reset to step 1
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBackToPersonalData = () => {
    setRegistrationStep(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header with Logo and Welcome Text */}
        <div className="text-center mb-6 lg:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-primary text-sm lg:text-base order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
            <img 
              src={hejTalentLogo} 
              alt="Hej Talent"
              className="h-10 md:h-12 lg:h-14 hover:scale-105 transition-transform duration-300 cursor-pointer order-1 sm:order-2" 
              onClick={() => navigate('/')}
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">
            Willkommen bei Hej Talent
          </h1>
          <p className="text-muted-foreground mb-4 text-sm lg:text-base">
            Ihr RaaS Hub für erstklassige Remote-Fachkräfte
          </p>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 lg:gap-4 mb-6">
            <Badge variant="secondary" className="animate-slide-in-left text-xs lg:text-sm">
              <Star className="w-3 h-3 mr-1 text-primary" />
              500+ Entwickler
            </Badge>
            <Badge variant="secondary" className="animate-slide-in-right text-xs lg:text-sm">
              <Shield className="w-3 h-3 mr-1 text-primary" />
              Geprüfte Qualität
            </Badge>
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm animate-scale-in">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Anmelden
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Registrieren
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-brand-dark">Willkommen zurück</CardTitle>
                <CardDescription className="text-base">
                  Melden Sie sich an und verwalten Sie Ihre KI-Projekte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-Mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Passwort</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Anmelden..." : "Anmelden"}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Noch kein Account? Wechseln Sie zum Tab "Registrieren"
                  </div>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup" className="animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-brand-dark">
                  Unternehmen registrieren - Schritt {registrationStep} von 2
                </CardTitle>
                <CardDescription className="text-base">
                  {registrationStep === 1 
                    ? "Starten Sie jetzt und finden Sie die besten KI-Entwickler für Ihr Unternehmen"
                    : "Vervollständigen Sie Ihr Unternehmensprofil"
                  }
                </CardDescription>
                
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mt-4">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    registrationStep >= 1 ? 'bg-primary' : 'bg-muted'
                  }`}></div>
                  <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    registrationStep >= 2 ? 'bg-primary' : 'bg-muted'
                  }`}></div>
                </div>
              </CardHeader>
              <CardContent>
                {registrationStep === 1 ? (
                  <form onSubmit={handlePersonalDataSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-name" className="text-sm lg:text-base">Vorname</Label>
                        <Input
                          id="first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="text-sm lg:text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last-name" className="text-sm lg:text-base">Nachname</Label>
                        <Input
                          id="last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="text-sm lg:text-base"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Position im Unternehmen</Label>
                      <Input
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        required
                        disabled={isSubmitting}
                        placeholder="z.B. Geschäftsführer, IT-Leiter, CTO"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">Telefonnummer *</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        disabled={isSubmitting}
                        placeholder="+49 123 456789"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">E-Mail</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Passwort</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                        minLength={6}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3" 
                      disabled={isSubmitting}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Weiter zu Schritt 2
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleCompanyDataSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Unternehmensname</Label>
                        <Input
                          id="company-name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company-email">Unternehmens-E-Mail</Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="info@unternehmen.de"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="company-website">Website (optional)</Label>
                        <Input
                          id="company-website"
                          type="url"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        className="flex-1 border-primary text-primary hover:bg-primary hover:text-white" 
                        onClick={goBackToPersonalData}
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-3" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Registrieren..." : "Jetzt registrieren"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
        
        {/* Benefits Section */}
        <div className="text-center mt-8 animate-fade-in-delay-1">
          <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-primary" />
              <span>Über 500 geprüfte KI-Entwickler</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>98% Kundenzufriedenheit</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>Persönliche Betreuung garantiert</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-brand-dark hover:bg-transparent group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Zurück zur Startseite
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;