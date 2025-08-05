import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Building2, MapPin, Clock, Euro, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchRequest {
  id: string;
  title: string;
  description?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  experience_level?: string;
  status: string;
  created_at: string;
  company: {
    name: string;
  };
  candidate_assignments: {
    id: string;
    status: string;
  }[];
}

export default function AdminSearchRequests() {
  const [searchRequests, setSearchRequests] = useState<SearchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSearchRequests();
  }, []);

  const fetchSearchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('search_requests')
        .select(`
          *,
          company:companies(name),
          candidate_assignments(id, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearchRequests(data || []);
    } catch (error) {
      console.error('Error fetching search requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = searchRequests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      active: "default",
      paused: "secondary",
      completed: "outline",
      cancelled: "destructive"
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getEmploymentTypeText = (type?: string) => {
    const types = {
      full_time: "Vollzeit",
      part_time: "Teilzeit",
      contract: "Vertrag",
      freelance: "Freelance"
    };
    return type ? types[type as keyof typeof types] : "Nicht angegeben";
  };

  const getExperienceLevelText = (level?: string) => {
    const levels = {
      junior: "Junior",
      mid: "Mid-Level",
      senior: "Senior",
      lead: "Lead"
    };
    return level ? levels[level as keyof typeof levels] : "Nicht angegeben";
  };

  const getAssignmentStats = (assignments: any[]) => {
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'proposed').length;
    const active = assignments.filter(a => ['reviewed', 'shortlisted', 'interview_scheduled'].includes(a.status)).length;
    const completed = assignments.filter(a => ['accepted', 'rejected'].includes(a.status)).length;

    return { total, pending, active, completed };
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suchaufträge verwalten</h1>
          <p className="text-muted-foreground">Alle Kundenaufträge im Überblick</p>
        </div>
      </div>

      {/* Filter und Suche */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Titel, Unternehmen oder Standort suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="paused">Pausiert</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Abgebrochen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suchaufträge Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Suchaufträge ({filteredRequests.length})</CardTitle>
          <CardDescription>
            Übersicht aller Kundenaufträge und deren Status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Keine Suchaufträge gefunden, die den Filterkriterien entsprechen."
                  : "Noch keine Suchaufträge vorhanden."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auftrag</TableHead>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Gehalt</TableHead>
                    <TableHead>Zuweisungen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const stats = getAssignmentStats(request.candidate_assignments);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.title}</p>
                            {request.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {request.location}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {request.company?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm">{getEmploymentTypeText(request.employment_type)}</p>
                            <p className="text-xs text-muted-foreground">{getExperienceLevelText(request.experience_level)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.salary_min && request.salary_max ? (
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              <span className="text-sm">
                                {request.salary_min.toLocaleString()} - {request.salary_max.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Nicht angegeben</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className="text-sm font-medium">{stats.total} gesamt</span>
                            </div>
                            {stats.pending > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {stats.pending} ausstehend
                              </Badge>
                            )}
                            {stats.active > 0 && (
                              <Badge variant="default" className="text-xs">
                                {stats.active} aktiv
                              </Badge>
                            )}
                            {stats.completed > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {stats.completed} abgeschlossen
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(request.status) as any}>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(request.created_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/search-requests/${request.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/search-requests/${request.id}/assignments`)}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Zuweisungen
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}