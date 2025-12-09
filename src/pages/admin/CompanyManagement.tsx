import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Eye, Building2, Mail, Globe, Users, FileText, Calendar, UserCheck, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/i18n";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteCompanyDialog, setDeleteCompanyDialog] = useState<{companyId: string, name: string, userCount: number} | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

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

  const deleteCompany = async (companyId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Nicht authentifiziert');
      }

      const { data, error } = await supabase.functions.invoke('delete-company', {
        body: { companyId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: t('companyManagement.toast.deleteSuccess'),
        description: t('companyManagement.toast.deleteSuccessDesc'),
      });

      // Unternehmensliste aktualisieren
      fetchCompanies();
      setDeleteCompanyDialog(null);
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast({
        title: t('companyManagement.toast.deleteError'),
        description: error.message || t('companyManagement.toast.deleteErrorDesc'),
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold">{t('companyManagement.title')}</h1>
          <p className="text-muted-foreground">{t('companyManagement.subtitle')}</p>
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companyManagement.stats.companies')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">{t('companyManagement.stats.registered')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companyManagement.stats.activeRequests')}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, company) => 
                sum + company.search_requests.filter(r => r.status === 'active').length, 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('companyManagement.stats.ongoingRequests')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companyManagement.stats.users')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, company) => sum + company.profiles.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">{t('companyManagement.stats.registeredUsers')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('companyManagement.stats.completed')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.reduce((sum, company) => 
                sum + company.search_requests.filter(r => r.status === 'completed').length, 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('companyManagement.stats.successfullyCompleted')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter und Suche */}
      <Card>
        <CardHeader>
          <CardTitle>{t('companyManagement.filters.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('companyManagement.filters.searchPlaceholder')}
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
          <CardTitle>{t('companyManagement.table.title').replace('{count}', String(filteredCompanies.length))}</CardTitle>
          <CardDescription>
            {t('companyManagement.table.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? t('companyManagement.empty.noMatch')
                  : t('companyManagement.empty.none')
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('companyManagement.table.cols.company')}</TableHead>
                    <TableHead>{t('companyManagement.table.cols.contact')}</TableHead>
                    <TableHead>{t('companyManagement.table.cols.contactInfo')}</TableHead>
                    <TableHead>{t('companyManagement.table.cols.activity')}</TableHead>
                    <TableHead>{t('companyManagement.table.cols.registered')}</TableHead>
                    <TableHead>{t('companyManagement.table.cols.actions')}</TableHead>
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
                            <span className="text-muted-foreground">{t('companyManagement.table.noContact')}</span>
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
                              {stats.totalUsers} {t('companyManagement.table.usersCount')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-3 w-3" />
                              <span className="text-sm font-medium">{stats.totalRequests} {t('companyManagement.table.requests')}</span>
                            </div>
                            {stats.activeRequests > 0 && (
                              <Badge variant="default" className="text-xs">
                                {stats.activeRequests} {t('companyManagement.table.active')}
                              </Badge>
                            )}
                            {stats.completedRequests > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {stats.completedRequests} {t('companyManagement.table.completedCount')}
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
                              {t('companyManagement.table.requestsBtn')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setDeleteCompanyDialog({
                                companyId: company.id,
                                name: company.name,
                                userCount: stats.totalUsers
                              })}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Unternehmen löschen Dialog */}
      <AlertDialog open={!!deleteCompanyDialog} onOpenChange={() => setDeleteCompanyDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('companyManagement.deleteDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {t('companyManagement.deleteDialog.confirm')} <strong>{deleteCompanyDialog?.name}</strong> {t('companyManagement.deleteDialog.confirmSuffix')}
              </p>
              {deleteCompanyDialog && deleteCompanyDialog.userCount > 0 ? (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                  <p className="text-destructive font-semibold">
                    ⚠️ {t('companyManagement.deleteDialog.hasUsers').replace('{count}', String(deleteCompanyDialog.userCount))}
                  </p>
                  <p className="text-sm text-destructive mt-1">
                    {t('companyManagement.deleteDialog.deleteUsersFirst')}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-destructive font-semibold">
                    {t('companyManagement.deleteDialog.irreversible')}
                  </p>
                  <p>
                    {t('companyManagement.deleteDialog.dataDeleted')}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>{t('companyManagement.deleteDialog.deleteItems.profile')}</li>
                    <li>{t('companyManagement.deleteDialog.deleteItems.tickets')}</li>
                    <li>{t('companyManagement.deleteDialog.deleteItems.invitations')}</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            {deleteCompanyDialog && deleteCompanyDialog.userCount === 0 && (
              <AlertDialogAction
                onClick={() => deleteCompanyDialog && deleteCompany(deleteCompanyDialog.companyId)}
                className="bg-destructive hover:bg-destructive/90"
              >
                {t('companyManagement.deleteDialog.confirmButton')}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}