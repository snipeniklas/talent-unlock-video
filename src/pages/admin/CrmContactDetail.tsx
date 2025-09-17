import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Mail, Phone, Smartphone, Building, Calendar, User, MessageSquare } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  position: string;
  department: string;
  status: string;
  priority: string;
  lead_source: string;
  notes: string;
  next_follow_up: string;
  last_contact_date: string;
  created_at: string;
  updated_at: string;
  crm_company_id: string;
  crm_companies?: {
    name: string;
    website: string;
    industry: string;
  };
}

export default function CrmContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('crm_contacts')
        .select(`
          *,
          crm_companies (
            name,
            website,
            industry
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast({
        title: t('common.error'),
        description: t('crm.contacts.detail.fetchError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800 border-gray-200',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'high': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/crm/contacts")}
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

  if (!contact) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/crm/contacts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">{t('crm.contacts.detail.notFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${contact.first_name} ${contact.last_name}`;
  const initials = `${contact.first_name?.charAt(0) || ''}${contact.last_name?.charAt(0) || ''}`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/crm/contacts")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="text-muted-foreground">{t('crm.contacts.detail.title')}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/crm/contacts/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          {t('common.actions.edit')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{fullName}</CardTitle>
                  <CardDescription className="text-base">
                    {contact.position && contact.department 
                      ? `${contact.position} • ${contact.department}`
                      : contact.position || contact.department || t('crm.contacts.detail.noPosition')
                    }
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(contact.status)}>
                      {t(`crm.contacts.status.${contact.status}`)}
                    </Badge>
                    <Badge className={getPriorityColor(contact.priority)}>
                      {t(`crm.contacts.priority.${contact.priority}`)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Contact Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('crm.contacts.detail.contactInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.contacts.fields.email')}</p>
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.contacts.fields.phone')}</p>
                      <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}
                {contact.mobile && (
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.contacts.fields.mobile')}</p>
                      <a href={`tel:${contact.mobile}`} className="text-primary hover:underline">
                        {contact.mobile}
                      </a>
                    </div>
                  </div>
                )}
                {contact.lead_source && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('crm.contacts.fields.leadSource')}</p>
                      <p>{contact.lead_source}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('crm.contacts.fields.notes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Information */}
          {contact.crm_companies && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t('crm.contacts.detail.company')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{contact.crm_companies.name}</p>
                    {contact.crm_companies.industry && (
                      <p className="text-sm text-muted-foreground">{contact.crm_companies.industry}</p>
                    )}
                  </div>
                  {contact.crm_companies.website && (
                    <a 
                      href={contact.crm_companies.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {contact.crm_companies.website}
                    </a>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => navigate(`/admin/crm/companies/${contact.crm_company_id}`)}
                  >
                    {t('crm.contacts.detail.viewCompany')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('crm.contacts.detail.timeline')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.last_contact_date && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('crm.contacts.fields.lastContactDate')}</p>
                  <p className="font-medium">
                    {new Date(contact.last_contact_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {contact.next_follow_up && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('crm.contacts.fields.nextFollowUp')}</p>
                  <p className="font-medium">
                    {new Date(contact.next_follow_up).toLocaleDateString()}
                  </p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">{t('crm.contacts.detail.created')}</p>
                <p className="font-medium">
                  {new Date(contact.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('crm.contacts.detail.lastUpdated')}</p>
                <p className="font-medium">
                  {new Date(contact.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
