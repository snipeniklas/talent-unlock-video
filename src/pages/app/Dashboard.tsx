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
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/i18n';
import { useUserData, useUserRole, useUserCompany } from '@/hooks/useUserData';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  
  // Use optimized hooks with React Query
  const { data: userData, isLoading: userLoading } = useUserData();
  const userRole = useUserRole();
  const company = useUserCompany();
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch } = useDashboardData();

  console.log('Dashboard Component State:', {
    userData,
    userLoading,
    dashboardData,
    dashboardLoading,
    dashboardError,
    userRole,
    company
  });

  const loading = userLoading || dashboardLoading;

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
            {dashboardLoading ? 'Laden...' : 'Aktualisieren'}
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300 p-3 lg:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium">{t('app.dashboard.cards.active.title', 'Aktive Suchaufträge')}</CardTitle>
            <Search className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-0 pt-1 lg:pt-2">
            <div className="text-xl lg:text-2xl font-bold text-primary">{dashboardData?.stats?.activeSearchRequests || 0}</div>
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
            <div className="text-2xl font-bold text-primary">{dashboardData?.stats?.totalSpecialists || 0}</div>
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
            <div className="text-2xl font-bold text-green-600">{dashboardData?.stats?.completedProjects || 0}</div>
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
            <div className="text-2xl font-bold text-orange-600">{dashboardData?.stats?.pendingRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {t('app.dashboard.cards.pending.caption', 'Warten auf Bearbeitung')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
      </div>

      {/* Quick Actions */}
      {userRole !== 'admin' && (
        <Card className="p-4 lg:p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-lg lg:text-xl">{t('app.dashboard.quick.title', 'Schnellzugriff')}</CardTitle>
            <CardDescription className="text-sm">
              {t('app.dashboard.quick.desc', 'Häufig verwendete Aktionen für effizientes Arbeiten')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <Button 
                variant="outline" 
                className="h-14 lg:h-16 xl:h-20 flex flex-col items-center justify-center gap-2 text-center"
                onClick={() => navigate('/app/search-requests/new')}
              >
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                <span className="text-xs lg:text-sm xl:text-base">{t('app.dashboard.quick.create', 'Neue Anfrage erstellen')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-14 lg:h-16 xl:h-20 flex flex-col items-center justify-center gap-2 text-center"
                onClick={() => navigate('/app/specialists')}
              >
                <Users className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                <span className="text-xs lg:text-sm xl:text-base">{t('app.dashboard.quick.browse', 'Spezialisten durchsuchen')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-14 lg:h-16 xl:h-20 flex flex-col items-center justify-center gap-2 sm:col-span-2 lg:col-span-1 text-center"
                onClick={() => navigate('/app/search-requests')}
              >
                <Search className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                <span className="text-xs lg:text-sm xl:text-base">{t('app.dashboard.quick.manage', 'Anfragen verwalten')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;