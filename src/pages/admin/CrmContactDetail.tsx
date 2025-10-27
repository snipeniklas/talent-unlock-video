import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Mail, Phone, Smartphone, Building, Calendar, User, MessageSquare, Sparkles, ExternalLink, Lightbulb, TrendingUp, CheckCircle2, UserPlus, List as ListIcon, Plus, X } from "lucide-react";
import { useTranslation } from "@/i18n/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContactEmailTimeline } from "@/components/ContactEmailTimeline";
import { ContactActivityTimeline } from "@/components/ContactActivityTimeline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Contact {
  id: string;
  user_id?: string; // Link to registered user
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
  inquiry: string;
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
  const queryClient = useQueryClient();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactResearchData, setContactResearchData] = useState<any>(null);
  const [companyResearchData, setCompanyResearchData] = useState<any>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [contactLists, setContactLists] = useState<any[]>([]);
  const [availableLists, setAvailableLists] = useState<any[]>([]);
  const [listDialogOpen, setListDialogOpen] = useState(false);

  const { data: existingResearch } = useQuery({
    queryKey: ['contact-research', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_research')
        .select('contact_research_data, company_research_data, researched_at')
        .eq('contact_id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: contactListMemberships, refetch: refetchLists } = useQuery({
    queryKey: ['contact-lists', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_list_members')
        .select(`
          list_id,
          crm_contact_lists (
            id,
            name,
            description
          )
        `)
        .eq('contact_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: allLists } = useQuery({
    queryKey: ['all-contact-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_lists')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existingResearch) {
      setContactResearchData(existingResearch.contact_research_data);
      setCompanyResearchData(existingResearch.company_research_data);
    }
  }, [existingResearch]);

  useEffect(() => {
    if (contactListMemberships) {
      setContactLists(contactListMemberships.map((m: any) => m.crm_contact_lists));
    }
  }, [contactListMemberships]);

  useEffect(() => {
    if (allLists && contactLists) {
      const contactListIds = contactLists.map(l => l.id);
      setAvailableLists(allLists.filter(l => !contactListIds.includes(l.id)));
    }
  }, [allLists, contactLists]);

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

  const performResearchMutation = useMutation({
    mutationFn: async () => {
      setIsResearching(true);
      const { data, error } = await supabase.functions.invoke('research-contact', {
        body: { contact_id: id }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setContactResearchData(data.data.contact);
      setCompanyResearchData(data.data.company);
      setIsResearching(false);
      queryClient.invalidateQueries({ queryKey: ['contact-research', id] });
      toast({
        title: "AI Research abgeschlossen",
        description: "Kontakt- und Unternehmensdaten wurden erfolgreich recherchiert.",
      });
    },
    onError: (error: any) => {
      setIsResearching(false);
      toast({
        title: "Research fehlgeschlagen",
        description: error.message || "Fehler beim Recherchieren der Kontaktdaten.",
        variant: "destructive"
      });
    }
  });

  const addToListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('crm_contact_list_members')
        .insert({
          list_id: listId,
          contact_id: id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetchLists();
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Zur Liste hinzugefügt",
        description: "Kontakt wurde erfolgreich zur Liste hinzugefügt.",
      });
    },
  });

  const removeFromListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('crm_contact_list_members')
        .delete()
        .eq('list_id', listId)
        .eq('contact_id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetchLists();
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Aus Liste entfernt",
        description: "Kontakt wurde erfolgreich aus der Liste entfernt.",
      });
    },
  });

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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => performResearchMutation.mutate()}
            disabled={isResearching}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isResearching ? 'Recherchiere...' : 'AI Research durchführen'}
          </Button>
          <Button onClick={() => navigate(`/admin/crm/contacts/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            {t('common.actions.edit')}
          </Button>
        </div>
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
                    {contact.user_id && (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <User className="h-3 w-3 mr-1" />
                        Registrierter Benutzer
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <ListIcon className="h-4 w-4" />
                        In Listen:
                      </p>
                      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Listen verwalten</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {contactLists.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Aktuelle Listen:</p>
                                {contactLists.map(list => (
                                  <div key={list.id} className="flex items-center justify-between p-2 border rounded-lg">
                                    <div>
                                      <p className="font-medium">{list.name}</p>
                                      {list.description && (
                                        <p className="text-xs text-muted-foreground">{list.description}</p>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFromListMutation.mutate(list.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {availableLists.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Zu Liste hinzufügen:</p>
                                {availableLists.map(list => (
                                  <div
                                    key={list.id}
                                    onClick={() => addToListMutation.mutate(list.id)}
                                    className="p-2 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                  >
                                    <p className="font-medium">{list.name}</p>
                                    {list.description && (
                                      <p className="text-xs text-muted-foreground">{list.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {availableLists.length === 0 && contactLists.length === 0 && (
                              <p className="text-center text-muted-foreground py-4">
                                Keine Listen verfügbar
                              </p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {contactLists.length > 0 ? (
                        contactLists.map(list => (
                          <Badge key={list.id} variant="outline" className="gap-1">
                            <ListIcon className="h-3 w-3" />
                            {list.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Keine Listen zugeordnet</p>
                      )}
                    </div>
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

          {/* Inquiry/Request */}
          {contact.inquiry && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Anliegen / Anfrage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{contact.inquiry}</p>
              </CardContent>
            </Card>
          )}

          {/* Outreach Activities Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Outreach Aktivitäten
              </CardTitle>
              <CardDescription>
                Kompletter Verlauf aller Outreach-Kampagnen und E-Mail-Interaktionen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactActivityTimeline contactId={contact.id} />
            </CardContent>
          </Card>
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

          {/* AI Research Data */}
          {(contactResearchData || companyResearchData) && (
            <>
              {contactResearchData && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Research - Kontakt
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {existingResearch?.researched_at && 
                          new Date(existingResearch.researched_at).toLocaleDateString()
                        }
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contactResearchData.summary && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Zusammenfassung</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contactResearchData.summary}</p>
                      </div>
                    )}
                    
                    {contactResearchData.professional_background && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Beruflicher Hintergrund</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contactResearchData.professional_background}</p>
                      </div>
                    )}
                    
                    {contactResearchData.key_facts && contactResearchData.key_facts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Wichtige Fakten</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {contactResearchData.key_facts.map((fact: string, idx: number) => (
                            <li key={idx} className="text-sm text-muted-foreground">{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {contactResearchData.interests && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Interessen</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contactResearchData.interests}</p>
                      </div>
                    )}
                    
                    {contactResearchData.recent_activities && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Aktuelle Aktivitäten</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contactResearchData.recent_activities}</p>
                      </div>
                    )}
                    
                    {contactResearchData.talking_points && contactResearchData.talking_points.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Gesprächsthemen</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {contactResearchData.talking_points.map((point: string, idx: number) => (
                            <li key={idx} className="text-sm text-muted-foreground">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {contactResearchData.social_profiles && Object.keys(contactResearchData.social_profiles).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Social Profiles</h4>
                        <div className="flex flex-wrap gap-2">
                          {contactResearchData.social_profiles.linkedin && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={contactResearchData.social_profiles.linkedin} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                              </a>
                            </Button>
                          )}
                          {contactResearchData.social_profiles.twitter && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={contactResearchData.social_profiles.twitter} target="_blank" rel="noopener noreferrer">
                                Twitter
                              </a>
                            </Button>
                          )}
                          {contactResearchData.social_profiles.github && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={contactResearchData.social_profiles.github} target="_blank" rel="noopener noreferrer">
                                GitHub
                              </a>
                            </Button>
                          )}
                          {contactResearchData.social_profiles.xing && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={contactResearchData.social_profiles.xing} target="_blank" rel="noopener noreferrer">
                                Xing
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {companyResearchData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-500" />
                      AI Research - Unternehmen
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {companyResearchData.overview && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Überblick</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{companyResearchData.overview}</p>
                      </div>
                    )}
                    
                    {companyResearchData.key_facts && companyResearchData.key_facts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Wichtige Fakten</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {companyResearchData.key_facts.map((fact: string, idx: number) => (
                            <li key={idx} className="text-sm text-muted-foreground">{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {companyResearchData.products_services && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Produkte & Dienstleistungen</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{companyResearchData.products_services}</p>
                      </div>
                    )}
                    
                    {companyResearchData.technology_stack && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Technologie-Stack</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{companyResearchData.technology_stack}</p>
                      </div>
                    )}
                    
                    {companyResearchData.challenges && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Herausforderungen</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{companyResearchData.challenges}</p>
                      </div>
                    )}
                    
                    {companyResearchData.opportunities && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Chancen</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{companyResearchData.opportunities}</p>
                      </div>
                    )}
                    
                    {companyResearchData.recent_news && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Aktuelle News</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{companyResearchData.recent_news}</p>
                      </div>
                    )}
                    
                    {companyResearchData.size_structure && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Größe & Struktur</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{companyResearchData.size_structure}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* User Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Benutzerstatus
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contact.user_id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Registriert</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dieser Kontakt hat sich als Benutzer registriert und kann sich im Portal anmelden.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => navigate(`/admin/settings?tab=users&user=${contact.user_id}`)}
                  >
                    Benutzerprofil anzeigen
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserPlus className="h-4 w-4" />
                    <span>Nicht registriert</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dieser Kontakt hat noch keinen Benutzerzugang.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Timeline */}
          <ContactEmailTimeline contactId={contact.id} />

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
