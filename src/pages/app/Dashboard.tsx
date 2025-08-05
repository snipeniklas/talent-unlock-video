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

const Dashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [stats, setStats] = useState({
    activeSearchRequests: 0,
    totalSpecialists: 0,
    completedProjects: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);

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

        // Fetch actual stats from the database
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && profileData.data?.company_id) {
          const [searchRequestsData, resourcesData] = await Promise.all([
            supabase
              .from('search_requests')
              .select('status')
              .eq('company_id', profileData.data.company_id),
            supabase
              .from('resources')
              .select('id')
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
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {userRole === 'company_admin' ? `Willkommen zurück bei ${companyName}` : 'Übersicht Ihrer Aktivitäten'}
          </p>
        </div>
        {userRole !== 'admin' && (
          <Button onClick={() => navigate('/app/search-requests/new')} className="bg-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Neue Anfrage
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Suchaufträge</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeSearchRequests}</div>
            <p className="text-xs text-muted-foreground">
              +2 seit letztem Monat
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spezialisten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalSpecialists}</div>
            <p className="text-xs text-muted-foreground">
              Verfügbare Experten
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Erfolgreiche Projekte
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Warten auf Bearbeitung
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
              Aktuelle Aktivitäten
            </CardTitle>
            <CardDescription>
              Ihre neuesten Suchaufträge und Updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Senior AI Engineer gesucht</p>
                  <p className="text-sm text-muted-foreground">Erstellt vor 2 Tagen</p>
                </div>
                <Badge variant="secondary">Aktiv</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Machine Learning Spezialist</p>
                  <p className="text-sm text-muted-foreground">Erstellt vor 1 Woche</p>
                </div>
                <Badge variant="outline">In Bearbeitung</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Scientist - Remote</p>
                  <p className="text-sm text-muted-foreground">Erstellt vor 2 Wochen</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Abgeschlossen</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Empfohlene Spezialisten
            </CardTitle>
            <CardDescription>
              Neue Experten für Ihre Anforderungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Max Mustermann</p>
                  <p className="text-sm text-muted-foreground">Senior AI Engineer • 8 Jahre Erfahrung</p>
                </div>
                <Button variant="outline" size="sm">
                  Profil ansehen
                </Button>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Sarah Schmidt</p>
                  <p className="text-sm text-muted-foreground">ML Spezialist • 6 Jahre Erfahrung</p>
                </div>
                <Button variant="outline" size="sm">
                  Profil ansehen
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dr. Anna Weber</p>
                  <p className="text-sm text-muted-foreground">Data Scientist • 10 Jahre Erfahrung</p>
                </div>
                <Button variant="outline" size="sm">
                  Profil ansehen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {userRole !== 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>
              Häufig verwendete Aktionen für effizientes Arbeiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/app/search-requests/new')}
              >
                <Plus className="w-6 h-6" />
                <span>Neue Anfrage erstellen</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/app/specialists')}
              >
                <Users className="w-6 h-6" />
                <span>Spezialisten durchsuchen</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate('/app/search-requests')}
              >
                <Search className="w-6 h-6" />
                <span>Anfragen verwalten</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;