import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ActivityTimeline } from "./ActivityTimeline";

interface TimelineEvent {
  id: string;
  type: 'campaign_created' | 'campaign_started' | 'campaign_paused' | 'campaign_completed' | 
        'contact_added' | 'contact_removed' | 'email_sent' | 'email_failed' | 'email_replied';
  timestamp: string;
  description: string;
  details?: string;
}

interface ContactActivityTimelineProps {
  contactId: string;
}

export function ContactActivityTimeline({ contactId }: ContactActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    subscribeToActivities();
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

      // Combine and sort all events by timestamp (newest first)
      const allEvents = [...sentEmailEvents, ...campaignEvents, ...receivedEmailEvents]
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

    return () => {
      supabase.removeChannel(sentEmailsChannel);
      supabase.removeChannel(receivedEmailsChannel);
      supabase.removeChannel(campaignContactsChannel);
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Aktivitäten werden geladen...</div>
      </div>
    );
  }

  return <ActivityTimeline events={events} />;
}
