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
import { trackEvent } from '@/components/FacebookPixel';
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';
import { useTranslation } from '@/i18n/i18n';

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        
        // Redirect authenticated users based on role
        if (session?.user) {
          // Defer role check to avoid blocking auth state change
          setTimeout(async () => {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            // Redirect based on role
            if (roleData?.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/app/dashboard');
            }
          }, 0);
        }
        
        if (loading) {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirect if already authenticated
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        // Redirect based on role
        if (roleData?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/app/dashboard');
        }
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
          title: t('auth.toast.loginFailed'),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t('auth.toast.loginSuccess'),
          description: t('auth.toast.welcomeBack'),
        });
      }
    } catch (error) {
      toast({
        title: t('auth.toast.error'),
        description: t('auth.toast.unexpectedError'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginEmail) {
      toast({
        title: t('auth.toast.emailRequired'),
        description: t('auth.toast.emailRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: t('auth.toast.resetSent'),
        description: t('auth.toast.resetSentDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.toast.error'),
        description: error.message || t('auth.toast.resetFailed'),
        variant: "destructive",
      });
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
            title: t('auth.toast.accountExists'),
            description: t('auth.toast.accountExistsDesc'),
            variant: "destructive",
          });
        } else {
          toast({
            title: t('auth.toast.signupFailed'),
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Check if user came from RaaS CTA on landing page
        const leadIntent = localStorage.getItem('raas_lead_intent');
        
        if (leadIntent) {
          try {
            const intentData = JSON.parse(leadIntent);
            
            // Track Facebook Lead Event
            trackEvent('Lead', {
              content_name: 'RaaS Registration Complete',
              content_category: 'Registration',
              value: 0,
              currency: 'EUR',
              status: intentData.source
            });
            
            // Cleanup localStorage
            localStorage.removeItem('raas_lead_intent');
          } catch (e) {
            console.error('Error parsing lead intent:', e);
          }
        }
        
        toast({
          title: t('auth.toast.signupSuccess'),
          description: t('auth.toast.signupSuccessDesc'),
        });
        setRegistrationStep(1); // Reset to step 1
      }
    } catch (error) {
      toast({
        title: t('auth.toast.error'),
        description: t('auth.toast.unexpectedError'),
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
              {t('auth.backToHome')}
            </Button>
            <img 
              src={hejTalentLogo} 
              alt="Hej Talent"
              className="h-10 md:h-12 lg:h-14 hover:scale-105 transition-transform duration-300 cursor-pointer order-1 sm:order-2" 
              onClick={() => navigate('/')}
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">
            {t('auth.welcome.title')}
          </h1>
          <p className="text-muted-foreground mb-4 text-sm lg:text-base">
            {t('auth.welcome.subtitle')}
          </p>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 lg:gap-4 mb-6">
            <Badge variant="secondary" className="animate-slide-in-left text-xs lg:text-sm">
              <Star className="w-3 h-3 mr-1 text-primary" />
              {t('auth.badges.developers')}
            </Badge>
            <Badge variant="secondary" className="animate-slide-in-right text-xs lg:text-sm">
              <Shield className="w-3 h-3 mr-1 text-primary" />
              {t('auth.badges.quality')}
            </Badge>
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-sm animate-scale-in">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                {t('auth.tabs.login')}
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                {t('auth.tabs.signup')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-brand-dark">{t('auth.login.title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('auth.login.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('auth.login.email')}</Label>
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
                    <Label htmlFor="login-password">{t('auth.login.password')}</Label>
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
                    {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={handlePasswordReset}
                  >
                    {t('auth.login.forgotPassword')}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    {t('auth.login.noAccount')}
                  </div>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="signup" className="animate-fade-in">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-brand-dark">
                  {t('auth.signup.title')} - {t('auth.signup.stepOf').replace('{step}', registrationStep.toString())}
                </CardTitle>
                <CardDescription className="text-base">
                  {registrationStep === 1 
                    ? t('auth.signup.step1Subtitle')
                    : t('auth.signup.step2Subtitle')
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
                        <Label htmlFor="first-name" className="text-sm lg:text-base">{t('auth.signup.firstName')} *</Label>
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
                        <Label htmlFor="last-name" className="text-sm lg:text-base">{t('auth.signup.lastName')} *</Label>
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
                      <Label htmlFor="position">{t('auth.signup.position')} *</Label>
                      <Input
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        required
                        disabled={isSubmitting}
                        placeholder={t('auth.signup.positionPlaceholder')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone-number">{t('auth.signup.phone')} *</Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                        disabled={isSubmitting}
                        placeholder={t('auth.signup.phonePlaceholder')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.signup.email')} *</Label>
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
                      <Label htmlFor="signup-password">{t('auth.signup.password')} *</Label>
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
                      {t('auth.signup.nextStep')}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleCompanyDataSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">{t('auth.signup.companyName')} *</Label>
                        <Input
                          id="company-name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company-email">{t('auth.signup.companyEmail')}</Label>
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
                        <Label htmlFor="company-website">{t('auth.signup.companyWebsite')}</Label>
                        <Input
                          id="company-website"
                          type="url"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          disabled={isSubmitting}
                          placeholder={t('auth.signup.websitePlaceholder')}
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
                        {t('auth.signup.prevStep')}
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary-hover text-white font-medium py-3" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
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
              <span>{t('auth.benefits.item1')}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>{t('auth.benefits.item2')}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>{t('auth.benefits.item3')}</span>
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
            {t('auth.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;