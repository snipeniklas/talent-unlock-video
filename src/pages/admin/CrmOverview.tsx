import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Plus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/i18n";

export default function CrmOverview() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalContacts: 0
  });
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [companiesResult, contactsResult] = await Promise.all([
        (supabase as any).from("crm_companies").select("id", { count: "exact" }),
        (supabase as any).from("crm_contacts").select("id", { count: "exact" })
      ]);

      setStats({
        totalCompanies: companiesResult.count || 0,
        totalContacts: contactsResult.count || 0
      });
    } catch (error) {
      console.error("Error fetching CRM stats:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('crm.overview.title')}</h1>
          <p className="text-muted-foreground">{t('crm.overview.subtitle')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('crm.overview.totalCompanies')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              {t('crm.overview.companies')}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('crm.overview.totalContacts')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts}</div>
            <p className="text-xs text-muted-foreground">
              {t('crm.overview.contacts')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
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
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate("/admin/crm/companies")}
                variant="outline"
                className="flex-1"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {t('common.actions.view')}
              </Button>
              <Button 
                onClick={() => navigate("/admin/crm/companies/new")}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('crm.companies.addNew')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
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
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate("/admin/crm/contacts")}
                variant="outline"
                className="flex-1"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {t('common.actions.view')}
              </Button>
              <Button 
                onClick={() => navigate("/admin/crm/contacts/new")}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('crm.contacts.addNew')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}