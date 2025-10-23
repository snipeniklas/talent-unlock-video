import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, Play, Pause, CheckCircle, Ban, Check, Edit, Trash2, Eye, Search,
  Filter, ChevronDown, RefreshCw, AlertCircle, RotateCcw, Lightbulb, UserPlus, Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { EmailPreviewModal } from "@/components/EmailPreviewModal";
import { ContactDetailDrawer } from "@/components/ContactDetailDrawer";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function OutreachCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [excludedFilter, setExcludedFilter] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // State for modals/drawers
  const [previewEmail, setPreviewEmail] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [expandedEmails, setExpandedEmails] = useState<string[]>([]);
  
  // State for realtime
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: campaign, refetch } = useQuery({
    queryKey: ["outreach-campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_campaigns")
        .select(`
          *,
          outreach_campaign_contacts(
            *,
            crm_contacts(*)
          ),
          outreach_email_sequences(*),
          outreach_sent_emails(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setLastUpdated(new Date());
      return data;
    },
  });

  // Use refetchInterval in a separate effect to avoid circular dependency
  useEffect(() => {
    if (campaign?.status === 'active') {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, refetch]);

  // Realtime subscriptions
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('campaign-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'outreach_sent_emails',
          filter: `campaign_id=eq.${id}`
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'outreach_campaign_contacts',
          filter: `campaign_id=eq.${id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetch]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("outreach_campaigns")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
      toast({
        title: "Status aktualisiert",
        description: "Der Kampagnenstatus wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleContactExclusionMutation = useMutation({
    mutationFn: async ({ contactId, exclude }: { contactId: string; exclude: boolean }) => {
      const { error } = await supabase
        .from("outreach_campaign_contacts")
        .update({ is_excluded: exclude })
        .eq("id", contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
      toast({
        title: "Status aktualisiert",
        description: "Der Kontaktstatus wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const bulkExcludeMutation = useMutation({
    mutationFn: async ({ contactIds, exclude }: { contactIds: string[]; exclude: boolean }) => {
      const { error } = await supabase
        .from("outreach_campaign_contacts")
        .update({ is_excluded: exclude })
        .in("id", contactIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
      setSelectedContacts([]);
      toast({
        title: "Kontakte aktualisiert",
        description: "Die ausgewählten Kontakte wurden erfolgreich aktualisiert.",
      });
    },
  });

  const retryEmailMutation = useMutation({
    mutationFn: async (emailId: string) => {
      // TODO: Implement retry logic via edge function
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "E-Mail erneut versendet",
        description: "Die E-Mail wird erneut versendet.",
      });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("outreach_campaigns")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Kampagne gelöscht",
        description: "Die Kampagne wurde erfolgreich gelöscht.",
      });
      navigate("/admin/outreach-campaigns");
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-muted";
    }
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-500";
      case "replied":
        return "bg-blue-500";
      case "bounced":
      case "failed":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  // Build activity timeline
  const buildTimeline = () => {
    if (!campaign) return [];
    
    const events: any[] = [];
    
    // Campaign created
    events.push({
      id: 'created',
      type: 'campaign_created',
      timestamp: campaign.created_at,
      description: 'Kampagne erstellt',
    });

    // Status changes (simplified - in real app would track from audit log)
    if (campaign.status === 'active' || campaign.status === 'paused' || campaign.status === 'completed') {
      events.push({
        id: 'started',
        type: 'campaign_started',
        timestamp: campaign.updated_at,
        description: 'Kampagne gestartet',
      });
    }

    // Contacts added
    campaign.outreach_campaign_contacts?.forEach((cc: any) => {
      events.push({
        id: `contact-${cc.id}`,
        type: 'contact_added',
        timestamp: cc.added_at,
        description: `Kontakt hinzugefügt: ${cc.crm_contacts.first_name} ${cc.crm_contacts.last_name}`,
      });
    });

    // Emails sent
    campaign.outreach_sent_emails?.forEach((email: any) => {
      events.push({
        id: `email-${email.id}`,
        type: email.status === 'failed' || email.status === 'bounced' ? 'email_failed' : 'email_sent',
        timestamp: email.sent_at,
        description: email.status === 'failed' || email.status === 'bounced' 
          ? `E-Mail fehlgeschlagen: ${email.subject}`
          : `E-Mail versendet: ${email.subject}`,
        details: email.error_message || undefined,
      });
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Filter and sort contacts
  const getFilteredContacts = () => {
    if (!campaign?.outreach_campaign_contacts) return [];
    
    let filtered = [...campaign.outreach_campaign_contacts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((cc: any) => {
        const fullName = `${cc.crm_contacts.first_name} ${cc.crm_contacts.last_name}`.toLowerCase();
        const email = cc.crm_contacts.email?.toLowerCase() || '';
        return fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
      });
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((cc: any) => statusFilter.includes(cc.status));
    }

    // Excluded filter
    if (excludedFilter === 'yes') {
      filtered = filtered.filter((cc: any) => cc.is_excluded);
    } else if (excludedFilter === 'no') {
      filtered = filtered.filter((cc: any) => !cc.is_excluded);
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        const nameA = `${a.crm_contacts.first_name} ${a.crm_contacts.last_name}`;
        const nameB = `${b.crm_contacts.first_name} ${b.crm_contacts.last_name}`;
        comparison = nameA.localeCompare(nameB);
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'date') {
        comparison = new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  // Calculate progress
  const getProgress = () => {
    if (!campaign?.outreach_campaign_contacts) return 0;
    const total = campaign.outreach_campaign_contacts.length;
    const processed = campaign.outreach_campaign_contacts.filter(
      (cc: any) => cc.status === 'completed' || cc.status === 'failed' || cc.status === 'bounced'
    ).length;
    return total > 0 ? (processed / total) * 100 : 0;
  };

  const handleProcessNow = async () => {
    setIsProcessing(true);
    // TODO: Trigger edge function to process campaign
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    toast({
      title: "Verarbeitung gestartet",
      description: "Die Kampagne wird jetzt verarbeitet.",
    });
  };

  if (!campaign) return <div>Laden...</div>;

  const filteredContacts = getFilteredContacts();
  const progress = getProgress();
  const timeline = buildTimeline();

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background pb-4 border-b">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/outreach-campaigns">
                  Outreach Kampagnen
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{campaign.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin/outreach-campaigns")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{campaign.name}</h1>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status === "active" && (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        Aktiv
                      </span>
                    )}
                    {campaign.status === "paused" && "Pausiert"}
                    {campaign.status === "completed" && "Abgeschlossen"}
                    {campaign.status === "draft" && "Entwurf"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">{campaign.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aktualisiert vor {Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <QuickActionsMenu
                campaignStatus={campaign.status}
                onAddContacts={() => toast({ title: "Kontakte hinzufügen", description: "Feature kommt bald" })}
                onAddSequence={() => toast({ title: "Sequenz hinzufügen", description: "Feature kommt bald" })}
                onProcessNow={handleProcessNow}
                onImportCsv={() => toast({ title: "CSV Import", description: "Feature kommt bald" })}
              />

              {(campaign.status === "paused" || campaign.status === "draft") && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/admin/outreach-campaigns/${id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kampagne bearbeiten</TooltipContent>
                </Tooltip>
              )}
              
              {campaign.status === "draft" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => updateStatusMutation.mutate("active")}>
                      <Play className="h-4 w-4 mr-2" />
                      Starten
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kampagne starten</TooltipContent>
                </Tooltip>
              )}
              
              {campaign.status === "active" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => updateStatusMutation.mutate("paused")}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausieren
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kampagne pausieren</TooltipContent>
                </Tooltip>
              )}
              
              {campaign.status === "paused" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => updateStatusMutation.mutate("active")}>
                        <Play className="h-4 w-4 mr-2" />
                        Fortsetzen
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Kampagne fortsetzen</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate("completed")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Abschließen
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Kampagne abschließen</TooltipContent>
                  </Tooltip>
                </>
              )}
              
              {campaign.status !== "active" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Kampagne wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
                          deleteCampaignMutation.mutate();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Kampagne löschen</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {campaign.status === 'active' && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Fortschritt: {Math.round(progress)}%
                </span>
                <span className="text-muted-foreground">
                  {campaign.outreach_campaign_contacts?.filter((cc: any) => 
                    cc.status === 'completed' || cc.status === 'failed' || cc.status === 'bounced'
                  ).length || 0} von {campaign.outreach_campaign_contacts?.length || 0} Kontakten verarbeitet
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Onboarding Hints */}
          {campaign.status === 'draft' && campaign.outreach_campaign_contacts?.length === 0 && (
            <Alert className="mt-4">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                💡 Tipp: Füge zuerst Kontakte hinzu, bevor du die Kampagne startest.
              </AlertDescription>
            </Alert>
          )}
          {campaign.status === 'paused' && (
            <Alert className="mt-4">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                💡 Tipp: Klicke auf "Fortsetzen" um die Kampagne fortzufahren.
              </AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <Alert className="mt-4">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Verarbeitung läuft...
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="contacts">
              Kontakte ({campaign.outreach_campaign_contacts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="sequences">
              E-Mail Sequenzen ({campaign.outreach_email_sequences?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="sent">
              Versendete E-Mails ({campaign.outreach_sent_emails?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Kontakte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign.outreach_campaign_contacts?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Versendete E-Mails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign.outreach_sent_emails?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    E-Mail Sequenzen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {campaign.outreach_email_sequences?.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {campaign.target_audience && (
              <Card>
                <CardHeader>
                  <CardTitle>Zielgruppe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {campaign.target_audience}
                  </p>
                </CardContent>
              </Card>
            )}

            {campaign.desired_cta && (
              <Card>
                <CardHeader>
                  <CardTitle>Call-to-Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {campaign.desired_cta}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>AI Anweisungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {campaign.ai_instructions || "Keine Anweisungen definiert"}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <CardTitle>Kontakte in dieser Kampagne</CardTitle>
                  
                  {/* Search & Filters */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Kontakt suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>

                    {/* Status Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Status {statusFilter.length > 0 && `(${statusFilter.length})`}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('pending')}
                          onCheckedChange={(checked) => {
                            setStatusFilter(checked 
                              ? [...statusFilter, 'pending']
                              : statusFilter.filter(s => s !== 'pending')
                            );
                          }}
                        >
                          Ausstehend
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('sent')}
                          onCheckedChange={(checked) => {
                            setStatusFilter(checked 
                              ? [...statusFilter, 'sent']
                              : statusFilter.filter(s => s !== 'sent')
                            );
                          }}
                        >
                          Gesendet
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('replied')}
                          onCheckedChange={(checked) => {
                            setStatusFilter(checked 
                              ? [...statusFilter, 'replied']
                              : statusFilter.filter(s => s !== 'replied')
                            );
                          }}
                        >
                          Beantwortet
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('bounced')}
                          onCheckedChange={(checked) => {
                            setStatusFilter(checked 
                              ? [...statusFilter, 'bounced']
                              : statusFilter.filter(s => s !== 'bounced')
                            );
                          }}
                        >
                          Bounced
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('failed')}
                          onCheckedChange={(checked) => {
                            setStatusFilter(checked 
                              ? [...statusFilter, 'failed']
                              : statusFilter.filter(s => s !== 'failed')
                            );
                          }}
                        >
                          Fehlgeschlagen
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={statusFilter.includes('completed')}
                          onCheckedChange={(checked) => {
                            setStatusFilter(checked 
                              ? [...statusFilter, 'completed']
                              : statusFilter.filter(s => s !== 'completed')
                            );
                          }}
                        >
                          Abgeschlossen
                        </DropdownMenuCheckboxItem>
                        {statusFilter.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setStatusFilter([])}>
                              Filter zurücksetzen
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Excluded Filter */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          {excludedFilter === 'yes' ? 'Ausgeschlossen' : excludedFilter === 'no' ? 'Aktiv' : 'Alle'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setExcludedFilter(null)}>
                          Alle anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setExcludedFilter('no')}>
                          Nur aktive
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setExcludedFilter('yes')}>
                          Nur ausgeschlossene
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Sortieren
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
                          Name (A-Z)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>
                          Name (Z-A)
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('status'); setSortOrder('asc'); }}>
                          Status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc'); }}>
                          Neueste zuerst
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('asc'); }}>
                          Älteste zuerst
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Bulk Actions */}
                {selectedContacts.length > 0 && (
                  <div className="mb-4 p-3 bg-primary/10 rounded-lg flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">
                      {selectedContacts.length} Kontakt(e) ausgewählt
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkExcludeMutation.mutate({ 
                          contactIds: selectedContacts, 
                          exclude: true 
                        })}
                        disabled={bulkExcludeMutation.isPending}
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Ausschließen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => bulkExcludeMutation.mutate({ 
                          contactIds: selectedContacts, 
                          exclude: false 
                        })}
                        disabled={bulkExcludeMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Wieder aufnehmen
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedContacts([])}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                )}

                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter.length > 0 || excludedFilter
                        ? "Keine Kontakte gefunden, die den Filterkriterien entsprechen."
                        : "Noch keine Kontakte hinzugefügt"}
                    </p>
                    {!searchQuery && statusFilter.length === 0 && !excludedFilter && (
                      <Button onClick={() => toast({ title: "Kontakte hinzufügen", description: "Feature kommt bald" })}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Kontakte hinzufügen
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredContacts.map((cc: any) => (
                      <div 
                        key={cc.id} 
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="checkbox"]')) {
                            return;
                          }
                          setSelectedContact(cc);
                        }}
                      >
                        <Checkbox
                          checked={selectedContacts.includes(cc.id)}
                          onCheckedChange={(checked) => {
                            setSelectedContacts(checked
                              ? [...selectedContacts, cc.id]
                              : selectedContacts.filter(id => id !== cc.id)
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {cc.crm_contacts.first_name} {cc.crm_contacts.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {cc.crm_contacts.email}
                          </p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className={getContactStatusColor(cc.status)}>
                                  {cc.status}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>Aktueller Status des Kontakts</TooltipContent>
                            </Tooltip>
                            {cc.next_sequence_number && cc.status !== "completed" && cc.status !== "failed" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline">
                                    Nächste E-Mail: #{cc.next_sequence_number}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Nächste E-Mail-Sequenz</TooltipContent>
                              </Tooltip>
                            )}
                            {cc.next_send_date && cc.status !== "completed" && cc.status !== "failed" && (
                              <Badge variant="outline">
                                {new Date(cc.next_send_date).toLocaleDateString("de-DE")}
                              </Badge>
                            )}
                            {cc.is_excluded && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="destructive">
                                    Ausgeschlossen
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>Kontakt ist von der Kampagne ausgeschlossen</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {cc.is_excluded ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleContactExclusionMutation.mutate({ 
                                      contactId: cc.id, 
                                      exclude: false 
                                    });
                                  }}
                                  disabled={toggleContactExclusionMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Wieder aufnehmen
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Kontakt wieder in Kampagne aufnehmen</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleContactExclusionMutation.mutate({ 
                                      contactId: cc.id, 
                                      exclude: true 
                                    });
                                  }}
                                  disabled={toggleContactExclusionMutation.isPending}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ausschließen
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Kontakt von Kampagne ausschließen</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sequences" className="space-y-4">
            {campaign.outreach_email_sequences?.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground mb-4">
                    Noch keine E-Mail-Sequenzen erstellt
                  </p>
                  <div className="flex justify-center">
                    <Button onClick={() => navigate(`/admin/outreach-campaigns/${id}/edit`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Sequenz bearbeiten
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              campaign.outreach_email_sequences?.map((sequence: any) => (
                <Card key={sequence.id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>E-Mail #{sequence.sequence_number}</CardTitle>
                      <div className="flex gap-2 items-center">
                        {sequence.delay_days > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline">+{sequence.delay_days} Tage</Badge>
                            </TooltipTrigger>
                            <TooltipContent>Wartezeit nach vorheriger E-Mail</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewEmail(sequence)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Vorschau
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>E-Mail-Vorschau anzeigen</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Betreff:</p>
                      <p className="text-sm text-muted-foreground">
                        {sequence.subject_template}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Nachricht:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {sequence.body_template}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Versendete E-Mails</CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.outreach_sent_emails?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Noch keine E-Mails versendet
                    </p>
                    {campaign.status === 'draft' && (
                      <p className="text-sm text-muted-foreground">
                        Starte die Kampagne um E-Mails zu versenden
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {campaign.outreach_sent_emails?.map((email: any) => {
                      const isExpanded = expandedEmails.includes(email.id);
                      const isFailed = email.status === 'failed' || email.status === 'bounced';
                      
                      return (
                        <Collapsible
                          key={email.id}
                          open={isExpanded}
                          onOpenChange={(open) => {
                            setExpandedEmails(open 
                              ? [...expandedEmails, email.id]
                              : expandedEmails.filter(id => id !== email.id)
                            );
                          }}
                        >
                          <div
                            className={`rounded-lg border ${isFailed ? 'border-destructive bg-destructive/5' : 'bg-card'}`}
                          >
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{email.subject}</p>
                                    {isFailed && <AlertCircle className="h-4 w-4 text-destructive" />}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Gesendet am {new Date(email.sent_at).toLocaleString("de-DE")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getContactStatusColor(email.status)}>
                                    {email.status}
                                  </Badge>
                                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="px-3 pb-3 space-y-3 border-t pt-3">
                                <div>
                                  <p className="text-sm font-medium mb-1">Nachricht:</p>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">
                                    {email.body}
                                  </p>
                                </div>
                                
                                {email.error_message && (
                                  <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                      <strong>Fehler:</strong> {email.error_message}
                                    </AlertDescription>
                                  </Alert>
                                )}
                                
                                {email.ms365_message_id && (
                                  <p className="text-xs text-muted-foreground">
                                    Message ID: {email.ms365_message_id}
                                  </p>
                                )}
                                
                                {isFailed && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => retryEmailMutation.mutate(email.id)}
                                        disabled={retryEmailMutation.isPending}
                                      >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Erneut versuchen
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>E-Mail erneut versenden</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <ActivityTimeline events={timeline} />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {previewEmail && (
          <EmailPreviewModal
            open={!!previewEmail}
            onClose={() => setPreviewEmail(null)}
            subject={previewEmail.subject_template}
            body={previewEmail.body_template}
            sequenceNumber={previewEmail.sequence_number}
          />
        )}

        {selectedContact && (
          <ContactDetailDrawer
            open={!!selectedContact}
            onClose={() => setSelectedContact(null)}
            contact={selectedContact}
            sentEmails={campaign.outreach_sent_emails || []}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
