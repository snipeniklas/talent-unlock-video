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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Play, Pause, CheckCircle, Ban, Check, Edit, Trash2, Eye, Search,
  Filter, ChevronDown, RefreshCw, AlertCircle, RotateCcw, Lightbulb, UserPlus, Plus,
  Calendar, Clock, Sparkles, TrendingUp, Send, AlertTriangle, MessageSquare, TestTube,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useMemo } from "react";
import { format, formatDistanceToNow, isToday, differenceInHours } from "date-fns";
import { de } from "date-fns/locale";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { EmailPreviewModal } from "@/components/EmailPreviewModal";
import { ContactDetailDrawer } from "@/components/ContactDetailDrawer";
import { QuickActionsMenu } from "@/components/QuickActionsMenu";
import { RemoveContactDialog, RemovalReason } from "@/components/RemoveContactDialog";
import { Checkbox } from "@/components/ui/checkbox";
import CsvImportDialog from "@/components/CsvImportDialog";
import AddContactsDialog from "@/components/AddContactsDialog";
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
  
  // State for timeline filter
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  
  // State for test email
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [contactToRemove, setContactToRemove] = useState<any>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  
  // State for CSV import dialog
  const [showCsvImportDialog, setShowCsvImportDialog] = useState(false);
  
  // State for Add Contacts dialog
  const [showAddContactsDialog, setShowAddContactsDialog] = useState(false);

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

  // Fetch creator profile
  const { data: creatorProfile } = useQuery({
    queryKey: ["campaign-creator", campaign?.created_by],
    queryFn: async () => {
      if (!campaign?.created_by) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("user_id", campaign.created_by)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!campaign?.created_by,
  });

  // Fetch upcoming activities
  const { data: upcomingActivities } = useQuery({
    queryKey: ["upcoming-activities", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_campaign_contacts")
        .select(`
          id,
          next_send_date,
          next_sequence_number,
          contact_id,
          crm_contacts(first_name, last_name)
        `)
        .eq("campaign_id", id)
        .eq("status", "pending")
        .not("next_send_date", "is", null)
        .order("next_send_date", { ascending: true })
        .limit(10);

      if (error) throw error;
      
      // Enrich with sequence info
      const enriched = await Promise.all(
        (data || []).map(async (activity: any) => {
          const { data: sequence } = await supabase
            .from("outreach_email_sequences")
            .select("subject_template")
            .eq("campaign_id", id)
            .eq("sequence_number", activity.next_sequence_number)
            .single();
          
          return {
            ...activity,
            subject: sequence?.subject_template || `Sequenz ${activity.next_sequence_number}`,
          };
        })
      );
      
      return enriched;
    },
    enabled: !!id,
  });

  // Fetch CRM emails for reply tracking
  const { data: crmEmails } = useQuery({
    queryKey: ["crm-emails", id],
    queryFn: async () => {
      if (!campaign?.outreach_campaign_contacts) return [];
      
      const contactIds = campaign.outreach_campaign_contacts.map((cc: any) => cc.contact_id);
      if (contactIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("crm_emails")
        .select("*")
        .in("contact_id", contactIds);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!campaign,
  });

  // Fetch contact activities for rejection tracking
  const { data: contactActivities } = useQuery({
    queryKey: ["contact-activities", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_contact_activities")
        .select("*")
        .eq("campaign_id", id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch campaign lists for CSV import
  const { data: campaignLists } = useQuery({
    queryKey: ["campaign-lists", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outreach_campaign_lists")
        .select(`
          list_id,
          crm_contact_lists(id, name)
        `)
        .eq("campaign_id", id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
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

  const removeContactMutation = useMutation({
    mutationFn: async ({ 
      campaignContact, 
      reason, 
      data 
    }: { 
      campaignContact: any; 
      reason: RemovalReason; 
      data?: { reply?: string; meetingDate?: Date; notes?: string };
    }) => {
      // Get user session for created_by
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Determine activity type
      let activityType = "removed_no_contact";
      if (reason === "reply_received") activityType = "removed_reply_received";
      if (reason === "meeting_booked") activityType = "removed_meeting_booked";

      // Create activity record
      const { error: activityError } = await supabase
        .from("outreach_contact_activities")
        .insert({
          campaign_id: id,
          contact_id: campaignContact.contact_id,
          activity_type: activityType,
          created_by: user.id,
          notes: data?.notes || null,
          reply_content: data?.reply || null,
          meeting_date: data?.meetingDate?.toISOString() || null,
        });

      if (activityError) throw activityError;

      // Remove from campaign (set is_excluded = true)
      const { error: excludeError } = await supabase
        .from("outreach_campaign_contacts")
        .update({ is_excluded: true, status: "completed" })
        .eq("id", campaignContact.id);

      if (excludeError) throw excludeError;

      // Remove from all contact lists
      const { error: listError } = await supabase
        .from("crm_contact_list_members")
        .delete()
        .eq("contact_id", campaignContact.contact_id);

      if (listError) throw listError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
      setShowRemoveDialog(false);
      setContactToRemove(null);
      toast({
        title: "Kontakt entfernt",
        description: "Der Kontakt wurde erfolgreich aus der Kampagne und allen Listen entfernt.",
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

  const sendTestEmailMutation = useMutation({
    mutationFn: async () => {
      // Close dialog immediately
      setShowTestDialog(false);
      
      // Show sending notification
      toast({
        title: "Test-E-Mails werden versendet",
        description: `${campaign?.outreach_email_sequences?.length || 0} E-Mails werden an ${testEmail} gesendet...`,
      });
      
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: { campaignId: id, testEmail },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Test-E-Mails erfolgreich versendet",
        description: `Alle E-Mail-Sequenzen wurden an ${testEmail} gesendet.`,
      });
      setTestEmail("");
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Versenden",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activateCampaignMutation = useMutation({
    mutationFn: async () => {
      // Get existing draft contacts
      const { data: draftContacts, error: draftError } = await supabase
        .from("outreach_campaign_contacts")
        .select("contact_id")
        .eq("campaign_id", id);

      if (draftError) throw draftError;

      const contactIds = draftContacts.map((c: any) => c.contact_id);

      // Calculate next_send_date (24h from now)
      const now = new Date();
      const nextSendDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      console.log(`🚀 Activating campaign. Next automated send: ${nextSendDate.toISOString()}`);

      // Update campaign status and set next_send_date
      const { error: updateError } = await supabase
        .from("outreach_campaigns")
        .update({ 
          status: "active",
          next_send_date: nextSendDate.toISOString()
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Set all draft contacts to "pending" status
      if (contactIds.length > 0) {
        const { error: contactError } = await supabase
          .from("outreach_campaign_contacts")
          .update({ status: "pending" })
          .eq("campaign_id", id)
          .in("contact_id", contactIds);

        if (contactError) throw contactError;
      }

      // Trigger immediate email send
      console.log("📧 Triggering immediate email send...");
      
      const { data, error: functionError } = await supabase.functions.invoke(
        "process-outreach-campaigns",
        {
          body: { 
            immediate: true,
            campaignId: id 
          }
        }
      );

      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error(`Email send failed: ${functionError.message}`);
      }

      console.log("✅ Immediate send completed:", data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
      toast({
        title: "Kampagne aktiviert! 🎉",
        description: `${data?.emails_sent || 0} E-Mails wurden sofort versendet. Nächster automatischer Versand: morgen zur gleichen Zeit.`,
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

  // Build activity timeline with enriched events
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

    // Status changes
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
      // Skip if contact data is missing
      if (!cc.crm_contacts) return;
      
      events.push({
        id: `contact-${cc.id}`,
        type: 'contact_added',
        timestamp: cc.added_at,
        description: `Kontakt hinzugefügt: ${cc.crm_contacts.first_name} ${cc.crm_contacts.last_name}`,
      });
      
      // Contact excluded/included
      if (cc.is_excluded) {
        events.push({
          id: `excluded-${cc.id}`,
          type: 'contact_excluded',
          timestamp: cc.updated_at,
          description: `Kontakt ausgeschlossen: ${cc.crm_contacts.first_name} ${cc.crm_contacts.last_name}`,
        });
      }
      
      // Sequence completed
      if (cc.status === 'completed') {
        events.push({
          id: `completed-${cc.id}`,
          type: 'sequence_completed',
          timestamp: cc.updated_at,
          description: `Alle Sequenzen abgeschlossen für ${cc.crm_contacts.first_name} ${cc.crm_contacts.last_name}`,
        });
      }
    });

    // Emails sent/failed
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
    
    // Email replies (from CRM emails)
    crmEmails?.forEach((email: any) => {
      if (email.direction === 'incoming') {
        events.push({
          id: `reply-${email.id}`,
          type: 'email_replied',
          timestamp: email.received_at,
          description: `Antwort erhalten: ${email.subject || 'Kein Betreff'}`,
        });
      }
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Calculate comprehensive statistics
  const calculateStats = useMemo(() => {
    if (!campaign) return null;
    
    const contacts = campaign.outreach_campaign_contacts || [];
    const emails = campaign.outreach_sent_emails || [];
    
    const totalContacts = contacts.length;
    const excludedCount = contacts.filter((c: any) => c.is_excluded).length;
    
    const sentEmails = emails.filter((e: any) => e.status === 'sent').length;
    const failedEmails = emails.filter((e: any) => e.status === 'failed').length;
    const bouncedCount = emails.filter((e: any) => e.status === 'bounced').length;
    
    const repliedContacts = contacts.filter((c: any) => c.status === 'replied');
    const repliedCount = repliedContacts.length;
    const responseRate = sentEmails > 0 
      ? ((repliedCount / sentEmails) * 100).toFixed(1) 
      : '0';
    
    const pendingContacts = contacts.filter((c: any) => 
      c.status === 'pending' && !c.is_excluded
    );
    const pendingCount = pendingContacts.length;
    
    const nextSend = pendingContacts
      .filter((c: any) => c.next_send_date)
      .sort((a: any, b: any) => new Date(a.next_send_date).getTime() - new Date(b.next_send_date).getTime())[0];
    
    const nextSendTime = nextSend 
      ? format(new Date(nextSend.next_send_date), 'HH:mm', { locale: de })
      : 'N/A';
    
    // Count rejected contacts (activity_type = 'removed_no_contact')
    const rejectedCount = contactActivities?.filter(
      (activity: any) => activity.activity_type === 'removed_no_contact'
    ).length || 0;
    
    // Count meetings booked (activity_type = 'removed_meeting_booked')
    const meetingCount = contactActivities?.filter(
      (activity: any) => activity.activity_type === 'removed_meeting_booked'
    ).length || 0;
    
    return {
      totalContacts,
      excludedCount,
      sentEmails,
      failedEmails,
      bouncedCount,
      repliedCount,
      responseRate,
      pendingCount,
      nextSendTime,
      rejectedCount,
      meetingCount,
    };
  }, [campaign, contactActivities]);

  // Calculate Smart Insights
  const calculateInsights = useMemo(() => {
    if (!campaign || !crmEmails) return null;
    
    const emails = campaign.outreach_sent_emails || [];
    const sequences = campaign.outreach_email_sequences || [];
    
    // Best send time (hour with most replies)
    const replyHours: number[] = [];
    emails.forEach((sent: any) => {
      const reply = crmEmails.find((email: any) => 
        email.direction === 'incoming' &&
        new Date(email.received_at) > new Date(sent.sent_at)
      );
      if (reply) {
        replyHours.push(new Date(sent.sent_at).getHours());
      }
    });
    
    let bestSendTime = null;
    if (replyHours.length > 0) {
      const hourCounts = replyHours.reduce((acc: any, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});
      const bestHour = Object.keys(hourCounts).reduce((a, b) => 
        hourCounts[a] > hourCounts[b] ? a : b
      );
      bestSendTime = {
        start: parseInt(bestHour),
        end: parseInt(bestHour) + 2,
      };
    }
    
    // Critical sequence (high bounce rate)
    const sequenceStats = sequences.map((seq: any) => {
      const seqEmails = emails.filter((e: any) => e.sequence_number === seq.sequence_number);
      const bounced = seqEmails.filter((e: any) => e.status === 'bounced' || e.status === 'failed').length;
      const total = seqEmails.length || 1;
      return {
        number: seq.sequence_number,
        bounceRate: ((bounced / total) * 100).toFixed(1),
      };
    });
    const criticalSequence = sequenceStats.find((s: any) => parseFloat(s.bounceRate) > 20);
    
    // Top performing sequence
    const performanceStats = sequences.map((seq: any) => {
      const seqEmails = emails.filter((e: any) => e.sequence_number === seq.sequence_number);
      const contacts = campaign.outreach_campaign_contacts || [];
      const replied = seqEmails.filter((e: any) => {
        const contact = contacts.find((c: any) => c.contact_id === e.contact_id);
        return contact?.status === 'replied';
      }).length;
      const sent = seqEmails.filter((e: any) => e.status === 'sent').length || 1;
      return {
        number: seq.sequence_number,
        responseRate: ((replied / sent) * 100).toFixed(1),
      };
    });
    const topSequence = performanceStats.sort((a: any, b: any) => 
      parseFloat(b.responseRate) - parseFloat(a.responseRate)
    )[0];
    
    return {
      bestSendTime,
      criticalSequence,
      topSequence: parseFloat(topSequence?.responseRate || '0') > 0 ? topSequence : null,
    };
  }, [campaign, crmEmails]);

  // Count today's activities
  const todayActivitiesCount = useMemo(() => {
    if (!campaign?.outreach_campaign_contacts) return 0;
    return campaign.outreach_campaign_contacts.filter((cc: any) => 
      cc.next_send_date && isToday(new Date(cc.next_send_date)) && !cc.is_excluded
    ).length;
  }, [campaign]);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isPast = date < now;
    
    if (isPast) {
      return 'ÜBERFÄLLIG';
    }
    
    if (isToday(date)) {
      return `heute um ${format(date, 'HH:mm', { locale: de })}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true, locale: de });
  };

  // Group timeline by date
  const groupedTimeline = useMemo(() => {
    const timeline = buildTimeline();
    
    // Filter by type
    let filtered = timeline;
    if (timelineFilter === 'emails') {
      filtered = timeline.filter(e => e.type === 'email_sent');
    } else if (timelineFilter === 'errors') {
      filtered = timeline.filter(e => e.type === 'email_failed');
    } else if (timelineFilter === 'replies') {
      filtered = timeline.filter(e => e.type === 'email_replied');
    }
    
    // Group by date
    const grouped = filtered.reduce((acc: any, event: any) => {
      const date = format(new Date(event.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});
    
    return grouped;
  }, [campaign, crmEmails, timelineFilter]);

  // Filter and sort contacts
  const getFilteredContacts = () => {
    if (!campaign?.outreach_campaign_contacts) return [];
    
    // Filter out contacts without crm_contacts data first
    let filtered = campaign.outreach_campaign_contacts.filter((cc: any) => cc.crm_contacts);

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
    
    try {
      const { data, error } = await supabase.functions.invoke(
        'process-outreach-campaigns',
        {
          body: { campaignId: id }
        }
      );

      if (error) throw error;

      toast({
        title: "✅ Verarbeitung erfolgreich",
        description: "E-Mails werden jetzt versendet.",
      });

      // Reload data
      await refetch();
      
    } catch (error: any) {
      console.error('Error processing campaign:', error);
      toast({
        title: "❌ Fehler bei Verarbeitung",
        description: error.message || "Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForceProcessNow = async () => {
    const confirmed = window.confirm(
      "⚠️ ACHTUNG: Dies ignoriert alle Delay-Einstellungen und sendet E-Mails sofort!\n\n" +
      "Dieser Modus ist NUR für Testing gedacht.\n\n" +
      "Fortfahren?"
    );
    
    if (!confirmed) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke(
        'process-outreach-campaigns',
        {
          body: { 
            campaignId: id,
            forceProcess: true
          }
        }
      );

      if (error) throw error;

      toast({
        title: "🧪 Test-Verarbeitung erfolgreich",
        description: "E-Mails wurden sofort versendet (Delays ignoriert).",
      });

      await refetch();
      
    } catch (error: any) {
      console.error('Error force-processing campaign:', error);
      toast({
        title: "❌ Fehler bei Force-Verarbeitung",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!campaign) return <div>Laden...</div>;

  const filteredContacts = getFilteredContacts();
  const progress = getProgress();
  const stats = calculateStats;
  const insights = calculateInsights;

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
                {creatorProfile && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    Absender: {creatorProfile.first_name} {creatorProfile.last_name}
                    {creatorProfile.email && ` (${creatorProfile.email})`}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Aktualisiert vor {Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <QuickActionsMenu
                campaignStatus={campaign.status}
                onAddContacts={() => {
                  if (!campaignLists || campaignLists.length === 0) {
                    toast({
                      title: "Keine Liste verknüpft",
                      description: "Die Kampagne hat keine Kontaktliste zugewiesen. Bitte fügen Sie zuerst eine Liste hinzu.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowAddContactsDialog(true);
                }}
                onAddSequence={() => toast({ title: "Sequenz hinzufügen", description: "Feature kommt bald" })}
                onProcessNow={handleProcessNow}
                onImportCsv={() => {
                  if (!campaignLists || campaignLists.length === 0) {
                    toast({
                      title: "Keine Liste verknüpft",
                      description: "Die Kampagne hat keine Kontaktliste zugewiesen. Bitte fügen Sie zuerst eine Liste hinzu.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowCsvImportDialog(true);
                }}
                onResetToDraft={() => updateStatusMutation.mutate("draft")}
              />

              {campaign.status === "draft" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/admin/outreach-campaigns/${id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Prompts bearbeiten
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Prompts und Einstellungen bearbeiten</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => setShowTestDialog(true)}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test senden
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Alle E-Mails an Test-Adresse senden</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => activateCampaignMutation.mutate()}
                        disabled={activateCampaignMutation.isPending}
                      >
                        {activateCampaignMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Versende erste E-Mails...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Kampagne aktivieren
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Kampagne aktivieren und erste E-Mails sofort versenden</TooltipContent>
                  </Tooltip>
                </>
              )}

              {(campaign.status === "paused") && (
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
                      <Button onClick={async () => {
                        await updateStatusMutation.mutateAsync("active");
                        await handleProcessNow();
                      }}>
                        <Play className="h-4 w-4 mr-2" />
                        Fortsetzen
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Kampagne fortsetzen und E-Mails senden</TooltipContent>
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

          {/* Today's Activities Alert */}
          {todayActivitiesCount > 0 && (
            <Alert className="mt-4 bg-blue-50 border-blue-200">
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-blue-900">
                  📅 {todayActivitiesCount} E-Mail{todayActivitiesCount > 1 ? 's' : ''} {todayActivitiesCount > 1 ? 'sind' : 'ist'} heute geplant
                </span>
                <Button 
                  size="sm" 
                  onClick={handleProcessNow}
                  disabled={isProcessing}
                  className="ml-4"
                >
                  Jetzt verarbeiten
                </Button>
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
            {/* Enhanced Statistics - 6 Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    👥 Gesamt Kontakte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalContacts || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.excludedCount || 0} ausgeschlossen
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    📧 Versendete E-Mails
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.sentEmails || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.failedEmails || 0} fehlgeschlagen
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    💬 Antwortquote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.responseRate || 0}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.repliedCount || 0} von {stats?.sentEmails || 0} Empfängern
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    ⏳ Ausstehend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats?.pendingCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nächste um {stats?.nextSendTime}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    🚫 Abgelehnt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.rejectedCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keine weitere Kontaktaufnahme gewünscht
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    📅 Terminquote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.meetingCount || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gebuchte Termine
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Send Time Information Card - Only show for active/paused campaigns */}
            {campaign.next_send_date && (campaign.status === 'active' || campaign.status === 'paused') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    📧 Versand-Informationen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nächster automatischer Versand</p>
                    <p className="text-lg font-semibold">
                      {new Date(campaign.next_send_date).toLocaleString('de-DE', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                      })} Uhr
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pro Sequenz werden maximal 10 E-Mails versendet.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Activities Card */}
            {upcomingActivities && upcomingActivities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    📅 Anstehende Aktivitäten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingActivities?.filter(activity => activity.crm_contacts).map((activity: any) => {
                      const isOverdue = new Date(activity.next_send_date) < new Date();
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {activity.crm_contacts.first_name} {activity.crm_contacts.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              Sequenz {activity.next_sequence_number}: {activity.subject}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isOverdue ? "destructive" : "default"} className="whitespace-nowrap">
                              {formatRelativeTime(activity.next_send_date)}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => toast({ 
                                title: "Senden geplant", 
                                description: "E-Mail wird beim nächsten Verarbeitungslauf gesendet" 
                              })}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Smart Insights Card */}
            {insights && (insights.bestSendTime || insights.criticalSequence || insights.topSequence) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    💡 Smart Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.bestSendTime && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Beste Sendezeit
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Die meisten Antworten kamen zwischen {insights.bestSendTime.start}:00 - {insights.bestSendTime.end}:00 Uhr
                      </p>
                    </div>
                  )}

                  {insights.criticalSequence && (
                    <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Hohe Abbruchrate
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        Sequenz {insights.criticalSequence.number} hat {insights.criticalSequence.bounceRate}% Bounce-Rate
                      </p>
                    </div>
                  )}

                  {insights.topSequence && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Top Sequenz
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                        Sequenz {insights.topSequence.number} hat {insights.topSequence.responseRate}% Antwortquote
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                          {cc.crm_contacts ? (
                            <>
                              <p className="font-medium truncate">
                                {cc.crm_contacts.first_name} {cc.crm_contacts.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {cc.crm_contacts.email}
                              </p>
                            </>
                          ) : (
                            <p className="font-medium text-muted-foreground truncate">
                              Kontakt gelöscht
                            </p>
                          )}
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
                                    setContactToRemove(cc);
                                    setShowRemoveDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Entfernen
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Kontakt aus Kampagne entfernen</TooltipContent>
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
            <Card>
              <CardHeader>
                <CardTitle>Aktivitäten Timeline</CardTitle>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant={timelineFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimelineFilter('all')}
                  >
                    Alle
                  </Button>
                  <Button 
                    variant={timelineFilter === 'emails' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimelineFilter('emails')}
                  >
                    📧 Nur E-Mails
                  </Button>
                  <Button 
                    variant={timelineFilter === 'errors' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimelineFilter('errors')}
                  >
                    ⚠️ Nur Fehler
                  </Button>
                  <Button 
                    variant={timelineFilter === 'replies' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimelineFilter('replies')}
                  >
                    💬 Nur Antworten
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(groupedTimeline).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Keine Aktivitäten gefunden
                  </p>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedTimeline)
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([date, events]) => (
                      <div key={date}>
                        <h3 className="text-sm font-semibold mb-3 sticky top-0 bg-background py-2 border-b">
                          {format(new Date(date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                        </h3>
                        <ActivityTimeline events={events as any[]} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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

        {/* Test Email Dialog */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test-E-Mails senden</DialogTitle>
              <DialogDescription>
                Alle E-Mail-Sequenzen werden sofort an die angegebene Test-Adresse gesendet.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">E-Mail-Adresse</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Es werden {campaign?.outreach_email_sequences?.length || 0} E-Mails versendet
                  (Erst-Mail + alle Follow-ups).
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={() => sendTestEmailMutation.mutate()}
                disabled={!testEmail || sendTestEmailMutation.isPending}
              >
                {sendTestEmailMutation.isPending ? "Sende..." : "Test senden"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {selectedContact && (
          <ContactDetailDrawer
            open={!!selectedContact}
            onClose={() => setSelectedContact(null)}
            contact={selectedContact}
            sentEmails={campaign.outreach_sent_emails || []}
          />
        )}

        {/* Remove Contact Dialog */}
        {contactToRemove && (
          <RemoveContactDialog
            open={showRemoveDialog}
            onOpenChange={setShowRemoveDialog}
            contactName={
              contactToRemove.crm_contacts 
                ? `${contactToRemove.crm_contacts.first_name} ${contactToRemove.crm_contacts.last_name}`
                : "Unbekannter Kontakt"
            }
            onConfirm={(reason, data) => {
              removeContactMutation.mutate({ 
                campaignContact: contactToRemove, 
                reason, 
                data 
              });
            }}
            isLoading={removeContactMutation.isPending}
          />
        )}

        {/* CSV Import Dialog */}
        <CsvImportDialog
          open={showCsvImportDialog}
          onOpenChange={setShowCsvImportDialog}
          type="contacts"
          preselectedListId={campaignLists?.[0]?.list_id}
          preselectedListName={(campaignLists?.[0]?.crm_contact_lists as any)?.name}
          campaignId={id}
          onImportComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
            toast({
              title: "Import erfolgreich",
              description: "Kontakte wurden importiert und zur Kampagne hinzugefügt.",
            });
          }}
        />

        {/* Add Contacts Dialog */}
        <AddContactsDialog
          open={showAddContactsDialog}
          onOpenChange={setShowAddContactsDialog}
          listId={campaignLists?.[0]?.list_id || ""}
          listName={(campaignLists?.[0]?.crm_contact_lists as any)?.name || ""}
          campaignId={id || ""}
          existingContactIds={campaign.outreach_campaign_contacts?.map((cc: any) => cc.contact_id) || []}
          onContactsAdded={() => {
            queryClient.invalidateQueries({ queryKey: ["outreach-campaign", id] });
          }}
        />
      </div>
    </TooltipProvider>
  );
}
