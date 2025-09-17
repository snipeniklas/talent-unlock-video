import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  CheckCircle, 
  Clock, 
  Plus, 
  TrendingUp,
  Building2,
  UserCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/i18n';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [recentSearchRequests, setRecentSearchRequests] = useState<any[]>([]);
  const [recommendedSpecialists, setRecommendedSpecialists] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeSearchRequests: 0,
    totalSpecialists: 0,
    completedProjects: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const { t, lang } = useTranslation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user role and profile
        const [roleData, profileData] = await Promise.all([
          supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('profiles')
            .select('company_id, companies(*)')
            .eq('user_id', user.id)
            .single()
        ]);

        if (roleData.data) {
          setUserRole(roleData.data.role);
        }

        if (profileData.data?.companies) {
          setCompanyName(profileData.data.companies.name);
        }

        // Fetch actual stats and recent data from the database
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && profileData.data?.company_id) {
          const [searchRequestsData, resourcesData, recentRequestsData] = await Promise.all([
            supabase
              .from('search_requests')
              .select('status')
              .eq('company_id', profileData.data.company_id),
            supabase
              .from('candidates')
              .select('id'),
            supabase
              .from('search_requests')
              .select('id, title, status, created_at')
              .eq('company_id', profileData.data.company_id)
              .order('created_at', { ascending: false })
              .limit(3)
          ]);

          const activeRequests = searchRequestsData.data?.filter(r => r.status === 'active').length || 0;
          const completedRequests = searchRequestsData.data?.filter(r => r.status === 'completed').length || 0;
          const pendingRequests = searchRequestsData.data?.filter(r => r.status === 'pending').length || 0;
          const totalSpecialists = resourcesData.data?.length || 0;

          setStats({
            activeSearchRequests: activeRequests,
            totalSpecialists,
            completedProjects: completedRequests,
            pendingRequests
          });

          // Set recent search requests
          setRecentSearchRequests(recentRequestsData.data || []);

          // Fetch recommended specialists (top rated and available)
          const { data: specialistsData } = await supabase
            .from('candidates')
            .select('id, first_name, last_name, current_position, experience_years, rating')
            .limit(3);

          setRecommendedSpecialists(specialistsData || []);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const locale = lang === 'en' ? 'en-US' : 'de-DE';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">{t('app.dashboard.title', 'Dashboard')}</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {userRole === 'company_admin' ? `${t('app.dashboard.welcomePrefix', 'Willkommen zurück bei')} ${companyName}` : t('app.dashboard.subtitle', 'Übersicht Ihrer Aktivitäten')}
          </p>
        </div>
        {userRole !== 'admin' && (
          <Button onClick={() => navigate('/app/search-requests/new')} className="bg-primary hover:bg-primary-hover w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="md:hidden">{t('app.dashboard.cta.newShort', 'RaaS Anfrage')}</span>
            <span className="hidden md:inline">{t('app.dashboard.cta.new', 'Neue Anfrage')}</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('app.dashboard.cards.active.title', 'Aktive Suchaufträge')}</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeSearchRequests}</div>
            <p className="text-xs text-muted-foreground">
              {t('app.dashboard.cards.active.delta', '+2 seit letztem Monat')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('app.dashboard.cards.specialists.title', 'Spezialisten')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSpecialists}</div>
            <p className="text-xs text-muted-foreground">
              {t('app.dashboard.cards.specialists.caption', 'Verfügbare Experten')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('app.dashboard.cards.completed.title', 'Abgeschlossen')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              {t('app.dashboard.cards.completed.caption', 'Erfolgreiche Projekte')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('app.dashboard.cards.pending.title', 'Ausstehend')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {t('app.dashboard.cards.pending.caption', 'Warten auf Bearbeitung')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
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
              {recentSearchRequests.length > 0 ? (
                recentSearchRequests.map((request, index) => (
                  <div 
                    key={request.id} 
                    className={`flex items-center justify-between ${index < recentSearchRequests.length - 1 ? 'border-b pb-3' : ''}`}
                  >
                    <div>
                      <p className="font-medium">{request.title}</p>
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
              {recommendedSpecialists.length > 0 ? (
                recommendedSpecialists.map((specialist, index) => (
                  <div 
                    key={specialist.id} 
                    className={`flex items-center justify-between ${index < recommendedSpecialists.length - 1 ? 'border-b pb-3' : ''}`}
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
      </div>

      {/* Quick Actions */}
      {userRole !== 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('app.dashboard.quick.title', 'Schnellzugriff')}</CardTitle>
            <CardDescription>
              {t('app.dashboard.quick.desc', 'Häufig verwendete Aktionen für effizientes Arbeiten')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/app/search-requests/new')}
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-sm md:text-base">{t('app.dashboard.quick.create', 'Neue Anfrage erstellen')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/app/specialists')}
              >
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-sm md:text-base">{t('app.dashboard.quick.browse', 'Spezialisten durchsuchen')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 md:h-20 flex flex-col items-center justify-center gap-2 sm:col-span-2 lg:col-span-1"
                onClick={() => navigate('/app/search-requests')}
              >
                <Search className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-sm md:text-base">{t('app.dashboard.quick.manage', 'Anfragen verwalten')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;