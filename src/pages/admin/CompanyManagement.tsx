import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Eye, Building2, Mail, Globe, Users, FileText, Calendar, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Company {
  id: string;
  name: string;
  email?: string;
  website?: string;
  created_at: string;
  profiles: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  }[];
  search_requests: {
    id: string;
    status: string;
  }[];
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          profiles(id, first_name, last_name, email),
          search_requests(id, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getCompanyStats = (company: Company) => {
    const totalUsers = company.profiles.length;
    const totalRequests = company.search_requests.length;
    const activeRequests = company.search_requests.filter(r => r.status === 'active').length;
    const completedRequests = company.search_requests.filter(r => r.status === 'completed').length;

    return { totalUsers, totalRequests, activeRequests, completedRequests };
  };

  const getCompanyAdmin = (profiles: any[]) => {
    // Erstes Profil als Ansprechpartner anzeigen
    return profiles.length > 0 ? profiles[0] : null;
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
          <h1 className="text-3xl font-bold">Unternehmensverwaltung</h1>
          <p className="text-muted-foreground">Alle Kundenunternehmen im Überblick</p>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unternehmen</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">Registrierte Unternehmen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Aufträge</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, company) => 
                sum + company.search_requests.filter(r => r.status === 'active').length, 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Laufende Suchaufträge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, company) => sum + company.profiles.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, company) => 
                sum + company.search_requests.filter(r => r.status === 'completed').length, 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Erfolgreich abgeschlossen</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter und Suche */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nach Unternehmen, E-Mail oder Website suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Unternehmen Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Unternehmen ({filteredCompanies.length})</CardTitle>
          <CardDescription>
            Übersicht aller registrierten Kundenunternehmen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Keine Unternehmen gefunden, die den Suchkriterien entsprechen."
                  : "Noch keine Unternehmen registriert."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unternehmen</TableHead>
                    <TableHead>Ansprechpartner</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Aktivität</TableHead>
                    <TableHead>Registriert</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => {
                    const stats = getCompanyStats(company);
                    const admin = getCompanyAdmin(company.profiles);
                    
                    return (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 p-2 bg-muted rounded-lg" />
                            <div>
                              <p className="font-medium">{company.name}</p>
                              {company.website && (
                                <a 
                                  href={company.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Globe className="h-3 w-3" />
                                  Website
                                </a>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {admin ? (
                            <div>
                              <p className="font-medium">
                                {admin.first_name} {admin.last_name}
                              </p>
                              {admin.email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {admin.email}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Kein Ansprechpartner</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {company.email && (
                              <p className="text-sm flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {company.email}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {stats.totalUsers} Benutzer
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              <span className="text-sm font-medium">{stats.totalRequests} Aufträge</span>
                            </div>
                            {stats.activeRequests > 0 && (
                              <Badge variant="default" className="text-xs">
                                {stats.activeRequests} aktiv
                              </Badge>
                            )}
                            {stats.completedRequests > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {stats.completedRequests} abgeschlossen
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(company.created_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/companies/${company.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/admin/search-requests?company=${company.id}`)}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Aufträge
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