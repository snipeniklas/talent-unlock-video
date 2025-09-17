import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, Edit, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/i18n";

interface CrmCompany {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size_category?: string;
  annual_revenue?: number;
  phone?: string;
  email?: string;
  status: string;
  created_at: string;
}

export default function CrmCompanies() {
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("crm_companies")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prospect": return "bg-yellow-100 text-yellow-800";
      case "qualified": return "bg-blue-100 text-blue-800";
      case "customer": return "bg-green-100 text-green-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('crm.companies.title')}</h1>
          <p className="text-muted-foreground">{t('crm.companies.subtitle')}</p>
        </div>
        <Button onClick={() => navigate("/admin/crm/companies/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {t('crm.companies.addNew')}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={`${t('common.actions.search')} ${t('crm.companies.title')}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(company.status)}>
                  {t(`crm.companies.status.${company.status}`)}
                </Badge>
              </div>
              {company.industry && (
                <CardDescription>{company.industry}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {company.website && (
                <p className="text-sm text-muted-foreground">
                  🌐 {company.website}
                </p>
              )}
              {company.email && (
                <p className="text-sm text-muted-foreground">
                  ✉️ {company.email}
                </p>
              )}
              {company.phone && (
                <p className="text-sm text-muted-foreground">
                  📞 {company.phone}
                </p>
              )}
              {company.annual_revenue && (
                <p className="text-sm text-muted-foreground">
                  💰 €{company.annual_revenue.toLocaleString()}
                </p>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/crm/companies/${company.id}`)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t('common.actions.view')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/crm/companies/${company.id}/edit`)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.actions.edit')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {searchTerm ? 'No companies found' : 'No companies yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first company'}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate("/admin/crm/companies/new")}>
              <Plus className="h-4 w-4 mr-2" />
              {t('crm.companies.addNew')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}