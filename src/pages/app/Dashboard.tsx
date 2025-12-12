import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Search, 
  CheckCircle, 
  Clock, 
  Plus, 
  TrendingUp,
  Building2,
  UserCheck,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/i18n';
import { useUserData, useUserRole, useUserCompany } from '@/hooks/useUserData';
import { useDashboardData } from '@/hooks/useDashboardData';
import { UserEmailWidget } from '@/components/UserEmailWidget';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect } from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, get, lang } = useTranslation();

  // German work area names (stored in DB) mapped to translation keys
  const workAreaTranslations: Record<string, string> = {
    'IT-Support': get<string[]>('app.newRequest.predefinedWorkAreas', [])[0] || 'IT-Support',
    'Mahnwesen': get<string[]>('app.newRequest.predefinedWorkAreas', [])[1] || 'Mahnwesen',
    'Buchhaltung': get<string[]>('app.newRequest.predefinedWorkAreas', [])[2] || 'Buchhaltung',
    'Kundenservice': get<string[]>('app.newRequest.predefinedWorkAreas', [])[3] || 'Kundenservice',
    'Datenverarbeitung': get<string[]>('app.newRequest.predefinedWorkAreas', [])[4] || 'Datenverarbeitung',
    'Qualitätssicherung': get<string[]>('app.newRequest.predefinedWorkAreas', [])[5] || 'Qualitätssicherung',
    'Projektmanagement': get<string[]>('app.newRequest.predefinedWorkAreas', [])[6] || 'Projektmanagement',
    'Marketing': get<string[]>('app.newRequest.predefinedWorkAreas', [])[7] || 'Marketing',
    'Vertrieb': get<string[]>('app.newRequest.predefinedWorkAreas', [])[8] || 'Vertrieb',
  };

  // Dynamically translate stored German text parts to current language
  const translateTitle = (title: string) => {
    const remoteWorkerTranslation = t('app.newRequest.remoteWorker', 'Remote-Mitarbeiter');
    return title.replace(/Remote-Mitarbeiter/g, remoteWorkerTranslation);
  };

  const translateDescription = (description: string | null) => {
    if (!description) return '';
    const workAreasLabel = t('app.newRequest.workAreasLabel', 'Benötigte Arbeitsbereiche');
    let translated = description.replace(/Benötigte Arbeitsbereiche/g, workAreasLabel);
    // Translate individual work area names
    Object.entries(workAreaTranslations).forEach(([german, translated_value]) => {
      translated = translated.replace(new RegExp(german, 'g'), translated_value);
    });
    return translated;
  };
  
  // Use optimized hooks with React Query
  const { data: userData, isLoading: userLoading, error: userError } = useUserData();
  const userRole = useUserRole();
  const company = useUserCompany();
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch } = useDashboardData();

  // Performance tracking
  useEffect(() => {
    const startTime = performance.now();
    console.log('Dashboard mount started');
    
    return () => {
      const endTime = performance.now();
      console.log(`Dashboard mount completed in ${endTime - startTime}ms`);
    };
  }, []);

  // Loading timeout warning
  useEffect(() => {
    if (userLoading || dashboardLoading) {
      const timeout = setTimeout(() => {
        console.warn('Dashboard loading is taking longer than expected');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [userLoading, dashboardLoading]);

  console.log('Dashboard Component State:', {
    userData,
    userLoading,
    dashboardData,
    dashboardLoading,
    dashboardError,
    userRole,
    company
  });

  const locale = lang === 'en' ? 'en-US' : 'de-DE';

  const DashboardSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-3 lg:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 p-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent className="p-0 pt-1 lg:pt-2">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (userError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t('app.dashboard.error.loadTitle', 'Fehler beim Laden')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('app.dashboard.error.loadUser', 'Benutzerdaten konnten nicht geladen werden.')}
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              {t('app.dashboard.error.reload', 'Seite neu laden')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading', 'Laden...')}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">{t('app.dashboard.title', 'Dashboard')}</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {userRole === 'company_admin' ? `${t('app.dashboard.welcomePrefix', 'Willkommen zurück bei')} ${company?.name || ''}` : t('app.dashboard.subtitle', 'Übersicht Ihrer Aktivitäten')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              size="sm"
              disabled={dashboardLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
              {dashboardLoading ? t('app.dashboard.loading', 'Laden...') : t('app.dashboard.refresh', 'Aktualisieren')}
            </Button>
          {userRole !== 'admin' && (
            <Button onClick={() => navigate('/app/search-requests/new')} className="bg-primary hover:bg-primary-hover w-full sm:w-auto text-sm lg:text-base">
              <Plus className="w-4 h-4 mr-2" />
              <span className="sm:hidden">{t('app.dashboard.cta.newShort', 'RaaS Anfrage')}</span>
              <span className="hidden sm:inline lg:hidden">{t('app.dashboard.cta.newMedium', 'Neue Anfrage')}</span>
              <span className="hidden lg:inline">{t('app.dashboard.cta.new', 'Neue Anfrage erstellen')}</span>
            </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {dashboardLoading ? (
          <DashboardSkeleton />
        ) : dashboardError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p>{t('app.dashboard.error.loadDashboard', 'Dashboard-Daten konnten nicht geladen werden.')}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              <Card 
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate('/app/search-requests')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium whitespace-nowrap">{t('app.dashboard.cards.active.title', 'Aktive Suchaufträge')}</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{dashboardData?.stats?.activeSearchRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('app.dashboard.cards.active.delta', 'Laufende Anfragen')}
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate('/app/specialists')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium whitespace-nowrap">{t('app.dashboard.cards.specialists.title', 'Spezialisten')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{dashboardData?.stats?.totalSpecialists || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('app.dashboard.cards.specialists.caption', 'Verfügbare Experten')}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium whitespace-nowrap">{t('app.dashboard.cards.completed.title', 'Abgeschlossen')}</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardData?.stats?.completedProjects || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('app.dashboard.cards.completed.caption', 'Erfolgreiche Projekte')}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium whitespace-nowrap">{t('app.dashboard.cards.pending.title', 'Ausstehend')}</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{dashboardData?.stats?.pendingRequests || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('app.dashboard.cards.pending.caption', 'Warten auf Bearbeitung')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Email Widget and Recent Activity */}
            <div className={`grid grid-cols-1 gap-4 lg:gap-6 ${userRole === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
              {userRole === 'admin' && (
                <div className="lg:col-span-1">
                  <UserEmailWidget />
                </div>
              )}
              
              <div className={userRole === 'admin' ? 'lg:col-span-2' : 'lg:col-span-1'}>
              <Card className="p-4 lg:p-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {t('app.dashboard.recent.title', 'Aktuelle Aktivitäten')}
                  </CardTitle>
                  <CardDescription>
                    {t('app.dashboard.recent.desc', 'Ihre neuesten Suchaufträge und Updates')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentRequests && dashboardData.recentRequests.length > 0 ? (
                      dashboardData.recentRequests.map((request, index) => (
                        <div 
                          key={request.id} 
                          className={`flex items-center justify-between ${index < dashboardData.recentRequests.length - 1 ? 'border-b pb-3' : ''}`}
                        >
                          <div>
                            <p className="font-medium">{translateTitle(request.title)}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('app.dashboard.recent.created', 'Erstellt')} {new Date(request.created_at).toLocaleDateString(locale, {
                                day: 'numeric',
                                month: 'long'
                              })}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              request.status === 'active' ? 'secondary' : 
                              request.status === 'completed' ? 'default' : 
                              'outline'
                            }
                            className={
                              request.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''
                            }
                          >
                            {request.status === 'active' ? t('app.status.active', 'Aktiv') : 
                             request.status === 'completed' ? t('app.status.completed', 'Abgeschlossen') : 
                             request.status === 'pending' ? t('app.status.pending', 'Ausstehend') : 
                             t('app.status.in_progress', 'In Bearbeitung')}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{t('app.dashboard.recent.empty.text', 'Noch keine Suchaufträge erstellt')}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => navigate('/app/search-requests/new')}
                        >
                          {t('app.dashboard.recent.empty.btn', 'Ersten Auftrag erstellen')}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
            
            {/* Recommended Specialists */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  {t('app.dashboard.recommended.title', 'Empfohlene Spezialisten')}
                </CardTitle>
                <CardDescription>
                  {t('app.dashboard.recommended.desc', 'Neue Experten für Ihre Anforderungen')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.specialists && dashboardData.specialists.length > 0 ? (
                    dashboardData.specialists.map((specialist, index) => (
                      <div 
                        key={specialist.id} 
                        className={`flex items-center justify-between ${index < dashboardData.specialists.length - 1 ? 'border-b pb-3' : ''}`}
                      >
                        <div>
                          <p className="font-medium">{specialist.first_name} {specialist.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {specialist.current_position || t('app.dashboard.recommended.fallbackRole', 'Spezialist')} • {specialist.experience_years || 0} {t('app.dashboard.recommended.years', 'Jahre Erfahrung')}
                            {specialist.rating && (
                              <span className="ml-2">⭐ {specialist.rating}/5</span>
                            )}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/app/specialists/${specialist.id}`)}
                        >
                          {t('app.dashboard.recommended.viewProfile', 'Profil ansehen')}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">{t('app.dashboard.recommended.empty.text', 'Noch keine Spezialisten verfügbar')}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/app/specialists')}
                      >
                        {t('app.dashboard.recommended.empty.btn', 'Spezialisten durchsuchen')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;