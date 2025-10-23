import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Users, Plus, ArrowRight, Clock, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/i18n";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface Stats {
  totalCompanies: number;
  totalContacts: number;
  companiesByStatus: Record<string, number>;
  contactsByPriority: Record<string, number>;
}

interface RecentItem {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  position?: string;
  priority?: string;
  created_at: string;
}

export default function CrmOverview() {
  const [stats, setStats] = useState<Stats>({
    totalCompanies: 0,
    totalContacts: 0,
    companiesByStatus: {},
    contactsByPriority: {}
  });
  const [recentCompanies, setRecentCompanies] = useState<RecentItem[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      const [
        companiesResult, 
        contactsResult,
        companiesData,
        contactsData,
        recentCompaniesData,
        recentContactsData
      ] = await Promise.all([
        (supabase as any).from("crm_companies").select("id", { count: "exact" }),
        (supabase as any).from("crm_contacts").select("id", { count: "exact" }),
        (supabase as any).from("crm_companies").select("status"),
        (supabase as any).from("crm_contacts").select("priority"),
        (supabase as any)
          .from("crm_companies")
          .select("id, name, status, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        (supabase as any)
          .from("crm_contacts")
          .select("id, first_name, last_name, position, status, priority, created_at")
          .order("created_at", { ascending: false })
          .limit(3)
      ]);

      // Calculate status breakdown for companies
      const companiesByStatus: Record<string, number> = {};
      companiesData.data?.forEach((company: any) => {
        const status = company.status || 'unknown';
        companiesByStatus[status] = (companiesByStatus[status] || 0) + 1;
      });

      // Calculate priority breakdown for contacts
      const contactsByPriority: Record<string, number> = {};
      contactsData.data?.forEach((contact: any) => {
        const priority = contact.priority || 'medium';
        contactsByPriority[priority] = (contactsByPriority[priority] || 0) + 1;
      });

      setStats({
        totalCompanies: companiesResult.count || 0,
        totalContacts: contactsResult.count || 0,
        companiesByStatus,
        contactsByPriority
      });

      setRecentCompanies(recentCompaniesData.data || []);
      setRecentContacts(recentContactsData.data || []);
    } catch (error) {
      console.error("Error fetching CRM stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      prospect: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      lead: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      customer: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('crm.overview.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('crm.overview.subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('crm.overview.totalCompanies')}</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-3xl font-bold mb-3">{stats.totalCompanies}</div>
            )}
            {loading ? (
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.companiesByStatus).map(([status, count]) => (
                  <Badge 
                    key={status} 
                    variant="secondary" 
                    className={getStatusColor(status)}
                  >
                    {count} {status}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('crm.overview.totalContacts')}</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <div className="text-3xl font-bold mb-3">{stats.totalContacts}</div>
            )}
            {loading ? (
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.contactsByPriority).map(([priority, count]) => (
                  <Badge 
                    key={priority} 
                    variant="secondary" 
                    className={getPriorityColor(priority)}
                  >
                    {count} {priority}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('crm.companies.title')}
            </CardTitle>
            <CardDescription>
              {t('crm.companies.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate("/admin/crm/companies")}
                variant="outline"
                className="flex-1"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                {t('common.actions.view')}
              </Button>
              <Button 
                onClick={() => navigate("/admin/crm/companies/new")}
                variant="default"
                className="flex-1"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('crm.companies.addNew')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('crm.contacts.title')}
            </CardTitle>
            <CardDescription>
              {t('crm.contacts.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate("/admin/crm/contacts")}
                variant="outline"
                className="flex-1"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                {t('common.actions.view')}
              </Button>
              <Button 
                onClick={() => navigate("/admin/crm/contacts/new")}
                variant="default"
                className="flex-1"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('crm.contacts.addNew')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Aufgaben
            </CardTitle>
            <CardDescription>
              CRM-Aufgaben verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate("/admin/crm/tasks")}
                variant="outline"
                className="flex-1"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                {t('common.actions.view')}
              </Button>
              <Button 
                onClick={() => navigate("/admin/crm/tasks/new")}
                variant="default"
                className="flex-1"
              >
                <Plus className="h-5 w-5 mr-2" />
                Neue Aufgabe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Added Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Neue Unternehmen
            </CardTitle>
            <CardDescription>
              Zuletzt hinzugefügt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Unternehmen
              </p>
            ) : (
              <div className="space-y-2">
                {recentCompanies.map((company) => (
                  <div
                    key={company.id}
                    onClick={() => navigate(`/admin/crm/companies/${company.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{company.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getStatusColor(company.status || 'prospect')}`}
                        >
                          {company.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(company.created_at), { 
                        addSuffix: true,
                        locale: de 
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Neue Kontakte
            </CardTitle>
            <CardDescription>
              Zuletzt hinzugefügt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentContacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Noch keine Kontakte
              </p>
            ) : (
              <div className="space-y-2">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => navigate(`/admin/crm/contacts/${contact.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {contact.position && (
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.position}
                          </p>
                        )}
                        {contact.priority && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getPriorityColor(contact.priority)}`}
                          >
                            {contact.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(contact.created_at), { 
                        addSuffix: true,
                        locale: de 
                      })}
                    </p>
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