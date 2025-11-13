import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Globe, 
  Calendar,
  Users,
  FileText,
  UserCheck,
  Clock,
  Edit
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/i18n";

interface Company {
  id: string;
  name: string;
  email?: string;
  website?: string;
  value_proposition?: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }[];
  search_requests: {
    id: string;
    title: string;
    status: string;
    created_at: string;
  }[];
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          profiles(
            id, 
            first_name, 
            last_name, 
            email, 
            phone
          ),
          search_requests(
            id,
            title,
            status,
            created_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: t('common.error', 'Fehler'),
        description: t('company.detail.fetchError', 'Fehler beim Laden der Unternehmensdaten'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t('company.detail.notFound', 'Unternehmen nicht gefunden')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalUsers: company.profiles.length,
    totalRequests: company.search_requests.length,
    activeRequests: company.search_requests.filter(r => r.status === 'active').length,
    completedRequests: company.search_requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/companies')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">
              {t('company.detail.subtitle', 'Unternehmensdetails')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Basic Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('company.detail.basicInfo', 'Grundinformationen')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('company.detail.companyName', 'Unternehmensname')}
                </label>
                <p className="mt-1 font-medium">{company.name}</p>
              </div>

              {company.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('company.detail.email', 'E-Mail')}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                      {company.email}
                    </a>
                  </div>
                </div>
              )}

              {company.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('company.detail.website', 'Website')}
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t('company.detail.registered', 'Registriert am')}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(company.created_at).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            </div>

            {company.value_proposition && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('company.detail.valueProposition', 'Wertversprechen')}
                  </label>
                  <p className="mt-1 text-sm">{company.value_proposition}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>{t('company.detail.statistics', 'Statistiken')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('company.detail.totalUsers', 'Benutzer')}
                </span>
                <span className="text-2xl font-bold">{stats.totalUsers}</span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('company.detail.totalRequests', 'Projekte gesamt')}
                </span>
                <span className="text-2xl font-bold">{stats.totalRequests}</span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {t('company.detail.activeRequests', 'Aktive Projekte')}
                </span>
                <span className="text-2xl font-bold text-green-600">{stats.activeRequests}</span>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  {t('company.detail.completedRequests', 'Abgeschlossen')}
                </span>
                <span className="text-2xl font-bold text-blue-600">{stats.completedRequests}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('company.detail.users', 'Benutzer')} ({company.profiles.length})
            </CardTitle>
            <CardDescription>
              {t('company.detail.usersDescription', 'Alle registrierten Benutzer dieses Unternehmens')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {company.profiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {t('company.detail.noUsers', 'Keine Benutzer gefunden')}
              </p>
            ) : (
              <div className="space-y-3">
                {company.profiles.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {user.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Requests */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('company.detail.searchRequests', 'Kundenprojekte')} ({company.search_requests.length})
            </CardTitle>
            <CardDescription>
              {t('company.detail.searchRequestsDescription', 'Alle Projekte und Aufträge dieses Unternehmens')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {company.search_requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {t('company.detail.noSearchRequests', 'Keine Projekte gefunden')}
              </p>
            ) : (
              <div className="space-y-3">
                {company.search_requests
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((request) => (
                    <div 
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/search-requests/${request.id}`)}
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{request.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {t(`searchRequest.status.${request.status}`, request.status)}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
