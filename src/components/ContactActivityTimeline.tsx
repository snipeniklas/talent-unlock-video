import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActivityTimeline } from "./ActivityTimeline";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  type: 'campaign_created' | 'campaign_started' | 'campaign_paused' | 'campaign_completed' | 
        'contact_added' | 'contact_removed' | 'contact_removed_reply' | 'contact_removed_meeting' | 
        'email_sent' | 'email_failed' | 'email_replied';
  timestamp: string;
  description: string;
  details?: string | any;
  replyContent?: string;
  meetingDate?: string;
}

interface ContactActivityTimelineProps {
  contactId: string;
}

export function ContactActivityTimeline({ contactId }: ContactActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const cleanup = subscribeToActivities();
    return cleanup;
  }, [contactId]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);

      // Fetch sent outreach emails
      const { data: sentEmails, error: sentError } = await supabase
        .from('outreach_sent_emails')
        .select(`
          id,
          sent_at,
          subject,
          status,
          error_message,
          outreach_campaigns(name),
          outreach_email_sequences(sequence_number)
        `)
        .eq('contact_id', contactId)
        .order('sent_at', { ascending: false });

      if (sentError) throw sentError;

      // Fetch campaign memberships
      const { data: campaigns, error: campaignsError } = await supabase
        .from('outreach_campaign_contacts')
        .select(`
          id,
          added_at,
          status,
          next_send_date,
          outreach_campaigns(name)
        `)
        .eq('contact_id', contactId)
        .order('added_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Fetch received emails
      const { data: receivedEmails, error: receivedError } = await supabase
        .from('crm_emails')
        .select('id, received_at, subject, from_email, from_name')
        .eq('contact_id', contactId)
        .order('received_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Fetch outreach contact activities (removal reasons, etc.)
      const { data: activities, error: activitiesError } = await supabase
        .from('outreach_contact_activities')
        .select(`
          id,
          activity_type,
          created_at,
          notes,
          reply_content,
          meeting_date,
          outreach_campaigns(name)
        `)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      // Map sent emails to timeline events
      const sentEmailEvents: TimelineEvent[] = (sentEmails || []).map(email => ({
        id: `sent-${email.id}`,
        type: email.status === 'failed' ? 'email_failed' : 'email_sent',
        timestamp: email.sent_at,
        description: email.status === 'failed' 
          ? `E-Mail fehlgeschlagen: ${email.subject}`
          : `E-Mail gesendet: ${email.subject}`,
        details: email.status === 'failed'
          ? `Fehler: ${email.error_message || 'Unbekannter Fehler'}`
          : `Kampagne: ${email.outreach_campaigns?.name || 'Unbekannt'} • Sequenz ${email.outreach_email_sequences?.sequence_number || '?'}`
      }));

      // Map campaign memberships to timeline events
      const campaignEvents: TimelineEvent[] = (campaigns || []).map(campaign => ({
        id: `campaign-${campaign.id}`,
        type: 'contact_added',
        timestamp: campaign.added_at,
        description: `Zur Kampagne hinzugefügt: ${campaign.outreach_campaigns?.name || 'Unbekannt'}`,
        details: `Status: ${campaign.status}`
      }));

      // Map received emails to timeline events
      const receivedEmailEvents: TimelineEvent[] = (receivedEmails || []).map(email => ({
        id: `received-${email.id}`,
        type: 'email_replied',
        timestamp: email.received_at,
        description: `Antwort erhalten: ${email.subject || '(Kein Betreff)'}`,
        details: `Von: ${email.from_name || email.from_email}`
      }));

      // Map outreach activities to timeline events
      const activityEvents: TimelineEvent[] = (activities || []).map(activity => {
        let description = '';
        let type: TimelineEvent['type'] = 'contact_removed';
        
        switch (activity.activity_type) {
          case 'removed_no_contact':
            description = `Aus Kampagne entfernt: ${activity.outreach_campaigns?.name || 'Unbekannt'}`;
            type = 'contact_removed';
            break;
          case 'removed_reply_received':
            description = `Aus Kampagne entfernt (Antwort erhalten): ${activity.outreach_campaigns?.name || 'Unbekannt'}`;
            type = 'contact_removed_reply';
            break;
          case 'removed_meeting_booked':
            description = `Aus Kampagne entfernt (Termin gebucht): ${activity.outreach_campaigns?.name || 'Unbekannt'}`;
            type = 'contact_removed_meeting';
            break;
          default:
            description = `Aktivität: ${activity.activity_type}`;
        }

        return {
          id: `activity-${activity.id}`,
          type,
          timestamp: activity.created_at,
          description,
          details: activity.notes,
          replyContent: activity.reply_content,
          meetingDate: activity.meeting_date
        };
      });

      // Combine and sort all events by timestamp (newest first)
      const allEvents = [...sentEmailEvents, ...campaignEvents, ...receivedEmailEvents, ...activityEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching contact activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToActivities = () => {
    // Subscribe to new sent emails
    const sentEmailsChannel = supabase
      .channel('sent-emails-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'outreach_sent_emails',
          filter: `contact_id=eq.${contactId}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    // Subscribe to new received emails
    const receivedEmailsChannel = supabase
      .channel('received-emails-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_emails',
          filter: `contact_id=eq.${contactId}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    // Subscribe to campaign contact changes
    const campaignContactsChannel = supabase
      .channel('campaign-contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'outreach_campaign_contacts',
          filter: `contact_id=eq.${contactId}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    // Subscribe to new outreach activities
    const activitiesChannel = supabase
      .channel('outreach-activities-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'outreach_contact_activities',
          filter: `contact_id=eq.${contactId}`
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sentEmailsChannel);
      supabase.removeChannel(receivedEmailsChannel);
      supabase.removeChannel(campaignContactsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Aktivitäten werden geladen...</div>
      </div>
    );
  }

  // Enhanced rendering with collapsible content for replies and meetings
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id}>
          <ActivityTimeline events={[event]} />
          
          {/* Collapsible content for reply or meeting */}
          {(event.replyContent || event.meetingDate) && (
            <div className="ml-12 mt-2">
              {event.replyContent && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                    <ChevronDown className="h-4 w-4" />
                    E-Mail Antwort anzeigen
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm whitespace-pre-wrap">{event.replyContent}</p>
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {event.meetingDate && (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Termin:</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.meetingDate), 'PPP', { locale: de })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
