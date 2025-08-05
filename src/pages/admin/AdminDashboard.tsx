import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, UserCheck, Clock, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalCandidates: number;
  totalSearchRequests: number;
  totalAssignments: number;
  pendingAssignments: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    totalSearchRequests: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
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
      const [resourcesResult, requestsResult, allocationsResult, pendingResult] = await Promise.all([
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('search_requests').select('id', { count: 'exact', head: true }),
        supabase.from('resource_allocations').select('id', { count: 'exact', head: true }),
        supabase.from('resource_allocations').select('id', { count: 'exact', head: true }).eq('status', 'proposed')
      ]);

      // Aktuelle Aktivitäten laden
      const { data: recentActivity } = await supabase
        .from('resource_allocations')
        .select(`
          id,
          status,
          allocated_at,
          search_request:search_requests(title, company:companies(name)),
          resource:resources(first_name, last_name)
        `)
        .order('allocated_at', { ascending: false })
        .limit(5);

      setStats({
        totalCandidates: resourcesResult.count || 0,
        totalSearchRequests: requestsResult.count || 0,
        totalAssignments: allocationsResult.count || 0,
        pendingAssignments: pendingResult.count || 0,
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
      proposed: "default",
      reviewed: "secondary", 
      shortlisted: "outline",
      interview_scheduled: "default",
      interview_completed: "secondary",
      offer_made: "outline",
      accepted: "default",
      rejected: "destructive"
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
          <p className="text-muted-foreground">HejTalent Mitarbeiterbereich</p>
        </div>
      </div>

      {/* Statistik Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ressourcen</CardTitle>
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
            <div className="text-2xl font-bold">{stats.totalSearchRequests}</div>
            <p className="text-xs text-muted-foreground">Kundenaufträge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zuweisungen</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Gesamte Zuweisungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">Wartende Zuweisungen</p>
          </CardContent>
        </Card>
      </div>

      {/* Schnellaktionen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bewerber verwalten</CardTitle>
            <CardDescription>Profile erstellen und bearbeiten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate('/admin/resources')} className="w-full">
              Alle Ressourcen anzeigen
            </Button>
            <Button onClick={() => navigate('/admin/resources/new')} variant="outline" className="w-full">
              Neue Ressource hinzufügen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kundenprojekte</CardTitle>
            <CardDescription>Kundenaufträge und Ressourcen-Zuweisungen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate('/admin/search-requests')} className="w-full">
              Alle Projekte anzeigen
            </Button>
            <Button onClick={() => navigate('/admin/allocations')} variant="outline" className="w-full">
              Ressourcen-Zuweisungen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Berichte</CardTitle>
            <CardDescription>Statistiken und Analysen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" disabled>
              Monatsbericht <Badge variant="secondary" className="ml-2">Bald</Badge>
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Performance <Badge variant="secondary" className="ml-2">Bald</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Letzte Aktivitäten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Letzte Aktivitäten
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
                      <p className="font-medium">
                        {activity.resource?.first_name} {activity.resource?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.search_request?.title} bei {activity.search_request?.company?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(activity.status) as any}>
                      {activity.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.allocated_at).toLocaleDateString('de-DE')}
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