import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Building2, Clock, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalCandidates: number;
  totalRequests: number;
  totalCompanies: number;
  openTickets: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalRequests: 0,
    totalCompanies: 0,
    openTickets: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Parallel queries für bessere Performance
      const [candidatesResult, requestsResult, companiesResult, ticketsResult] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('search_requests').select('id', { count: 'exact', head: true }),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      // Aktuelle Aktivitäten laden
      const { data: recentActivity } = await supabase
        .from('search_requests')
        .select(`
          id,
          title,
          created_at,
          status,
          company:companies(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalCandidates: candidatesResult.count || 0,
        totalRequests: requestsResult.count || 0,
        totalCompanies: companiesResult.count || 0,
        openTickets: ticketsResult.count || 0,
        recentActivity: recentActivity || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "default",
      completed: "secondary", 
      cancelled: "destructive",
      draft: "outline"
    };
    return colors[status as keyof typeof colors] || "default";
  };

  if (loading) {
    return <div className="p-6">Lade Dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Hej Talent Verwaltungsbereich</p>
        </div>
      </div>

      {/* Statistik Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RaaS Ressourcen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">Verfügbare Ressourcen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suchaufträge</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">Kundenaufträge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unternehmen</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Registrierte Unternehmen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">Offene Tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Schnellaktionen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>RaaS Ressourcen</CardTitle>
            <CardDescription>Ressourcen verwalten und hinzufügen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate('/admin/candidates')} className="w-full">
              Alle Ressourcen anzeigen
            </Button>
            <Button onClick={() => navigate('/admin/candidates/new')} variant="outline" className="w-full">
              Neue Ressource hinzufügen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kundenprojekte</CardTitle>
            <CardDescription>Kundenaufträge verwalten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate('/admin/search-requests')} className="w-full">
              Alle Projekte anzeigen
            </Button>
            <Button onClick={() => navigate('/admin/companies')} variant="outline" className="w-full">
              Unternehmen verwalten
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support & Settings</CardTitle>
            <CardDescription>Support und Systemeinstellungen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate('/admin/support')} className="w-full">
              Support Chat
            </Button>
            <Button onClick={() => navigate('/admin/settings')} variant="outline" className="w-full">
              Einstellungen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Letzte Aktivitäten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Letzte Suchaufträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length === 0 ? (
            <p className="text-muted-foreground">Keine aktuellen Aktivitäten</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.company?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(activity.status) as any}>
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}