import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Mail, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Email {
  id: string;
  subject: string;
  from_email: string;
  from_name: string;
  body_preview: string;
  received_at: string;
  is_read: boolean;
  importance: string;
}

interface ContactEmailTimelineProps {
  contactId: string;
}

export const ContactEmailTimeline = ({ contactId }: ContactEmailTimelineProps) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
    subscribeToEmails();
  }, [contactId]);

  const fetchEmails = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_emails")
        .select("*")
        .eq("contact_id", contactId)
        .order("received_at", { ascending: false });

      if (error) {
        console.error("Error fetching emails:", error);
        return;
      }

      setEmails(data || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToEmails = () => {
    const channel = supabase
      .channel("crm_emails_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "crm_emails",
          filter: `contact_id=eq.${contactId}`,
        },
        (payload) => {
          console.log("New email received:", payload);
          setEmails((current) => [payload.new as Email, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 animate-pulse" />
          <span>Lade E-Mails...</span>
        </div>
      </Card>
    );
  }

  if (emails.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Mail className="h-8 w-8" />
          <p>Keine E-Mails für diesen Kontakt</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5" />
        <h3 className="font-semibold">E-Mail Verlauf</h3>
        <Badge variant="secondary">{emails.length}</Badge>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {emails.map((email) => (
            <div
              key={email.id}
              className="border-l-2 border-primary/20 pl-4 pb-4 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{email.subject || "(Kein Betreff)"}</span>
                    {!email.is_read && (
                      <Badge variant="secondary" className="text-xs">
                        Neu
                      </Badge>
                    )}
                    {email.importance === "high" && (
                      <Badge variant="destructive" className="text-xs">
                        Wichtig
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Von: {email.from_name || email.from_email}
                  </p>
                  <p className="text-sm line-clamp-2">{email.body_preview}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {format(new Date(email.received_at), "dd.MM.yy HH:mm", { locale: de })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
