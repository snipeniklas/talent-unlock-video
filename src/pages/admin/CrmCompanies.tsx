import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Search, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/i18n/i18n';

interface CrmCompany {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  status: string;
  phone?: string;
  email?: string;
  created_at: string;
}

const CrmCompanies = () => {
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('crm.companies.deleteConfirm', 'Are you sure you want to delete this company?'))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('crm_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCompanies(companies.filter(company => company.id !== id));
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'customer': return 'default';
      case 'qualified': return 'secondary';
      case 'prospect': return 'outline';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('crm.companies.title', 'Companies')}
          </h1>
          <p className="text-muted-foreground">
            Manage your company database
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/crm/companies/new">
            <Plus className="h-4 w-4 mr-2" />
            {t('crm.companies.newCompany', 'New Company')}
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('crm.actions.search', 'Search...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('crm.companies.noCompanies', 'No companies yet')}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {t('crm.companies.createFirst', 'Create your first company')}
            </p>
            <Button asChild>
              <Link to="/admin/crm/companies/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('crm.companies.newCompany', 'New Company')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{company.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {company.industry && (
                      <span>{company.industry}</span>
                    )}
                    {company.website && (
                      <>
                        <span>•</span>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(company.status)}>
                    {company.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/admin/crm/companies/${company.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Email:</strong> {company.email || 'Not provided'}
                  </div>
                  <div>
                    <strong>Phone:</strong> {company.phone || 'Not provided'}
                  </div>
                  <div>
                    <strong>Created:</strong> {new Date(company.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrmCompanies;