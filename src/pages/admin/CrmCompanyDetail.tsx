import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Mail, Phone, Globe, MapPin, Building, Users, Euro, MessageSquare, Calendar } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  size_category: string;
  annual_revenue: number;
  phone: string;
  email: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  position: string;
  status: string;
  priority: string;
}

export default function CrmCompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCompany();
      fetchCompanyContacts();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('crm_companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast({
        title: t('common.error'),
        description: t('crm.companies.detail.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyContacts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('crm_contacts')
        .select('id, first_name, last_name, email, position, status, priority')
        .eq('crm_company_id', id);

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching company contacts:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'prospect': 'bg-blue-100 text-blue-800 border-blue-200',
      'qualified': 'bg-purple-100 text-purple-800 border-purple-200',
      'customer': 'bg-green-100 text-green-800 border-green-200',
      'inactive': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getContactStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 border-blue-200',
      'contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'qualified': 'bg-purple-100 text-purple-800 border-purple-200',
      'proposal': 'bg-orange-100 text-orange-800 border-orange-200',
      'negotiation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'won': 'bg-green-100 text-green-800 border-green-200',
      'lost': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatRevenue = (revenue: number) => {
    if (revenue >= 1000000) {
      return `${(revenue / 1000000).toFixed(1)}M €`;
    } else if (revenue >= 1000) {
      return `${(revenue / 1000).toFixed(0)}K €`;
    }
    return `${revenue} €`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/crm/companies")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/crm/companies")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">{t('crm.companies.detail.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companyInitials = company.name.split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/crm/companies")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{t('crm.companies.detail.title')}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/crm/companies/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          {t('common.actions.edit')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Company Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{companyInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{company.name}</CardTitle>
                  <CardDescription className="text-base">
                    {company.industry || t('crm.companies.detail.noIndustry')}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(company.status)}>
                      {t(`crm.companies.status.${company.status}`)}
                    </Badge>
                    {company.size_category && (
                      <Badge variant="outline">
                        {company.size_category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('crm.companies.detail.contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.companies.fields.email')}</p>
                      <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                        {company.email}
                      </a>
                    </div>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.companies.fields.phone')}</p>
                      <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.companies.fields.website')}</p>
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                {(company.address_street || company.address_city) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.companies.detail.address')}</p>
                      <div className="space-y-1">
                        {company.address_street && <p>{company.address_street}</p>}
                        {(company.address_city || company.address_postal_code) && (
                          <p>
                            {company.address_postal_code} {company.address_city}
                          </p>
                        )}
                        {company.address_country && <p>{company.address_country}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('crm.companies.detail.contacts')} ({contacts.length})
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/crm/contacts/new', { 
                    state: { preselectedCompanyId: id } 
                  })}
                >
                  {t('crm.companies.detail.addContact')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/crm/contacts/${contact.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                          <p className="text-sm text-muted-foreground">{contact.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getContactStatusColor(contact.status)} variant="outline">
                          {t(`crm.contacts.status.${contact.status}`)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('crm.companies.detail.noContacts')}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/admin/crm/contacts/new', { 
                      state: { preselectedCompanyId: id } 
                    })}
                  >
                    {t('crm.companies.detail.addFirstContact')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {company.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('crm.companies.fields.notes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{company.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t('crm.companies.detail.stats')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.annual_revenue && (
                <div className="flex items-center gap-3">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('crm.companies.fields.annualRevenue')}</p>
                    <p className="font-medium">{formatRevenue(company.annual_revenue)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('crm.companies.detail.totalContacts')}</p>
                  <p className="font-medium">{contacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('crm.companies.detail.timeline')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('crm.companies.detail.created')}</p>
                <p className="font-medium">
                  {new Date(company.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('crm.companies.detail.lastUpdated')}</p>
                <p className="font-medium">
                  {new Date(company.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}