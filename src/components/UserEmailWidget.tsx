import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MS365ConnectButton } from "@/components/MS365ConnectButton";
import { Mail, TrendingUp, Clock, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EmailStats {
  totalEmails: number;
  unreadEmails: number;
  todayEmails: number;
  isConnected: boolean;
  emailAddress: string | null;
}

export const UserEmailWidget = () => {
  const [stats, setStats] = useState<EmailStats>({
    totalEmails: 0,
    unreadEmails: 0,
    todayEmails: 0,
    isConnected: false,
    emailAddress: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check if user has connected MS365
      const { data: tokenData } = await supabase
        .from("ms365_tokens")
        .select("email_address")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!tokenData) {
        setIsLoading(false);
        return;
      }

      // Get email statistics
      const { data: emails, error } = await supabase
        .from("crm_emails")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching email stats:", error);
        setIsLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const unreadCount = emails?.filter((e) => !e.is_read).length || 0;
      const todayCount = emails?.filter(
        (e) => new Date(e.received_at) >= today
      ).length || 0;

      setStats({
        totalEmails: emails?.length || 0,
        unreadEmails: unreadCount,
        todayEmails: todayCount,
        isConnected: true,
        emailAddress: tokenData.email_address,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4 animate-pulse" />
          <span>Lade E-Mail Statistiken...</span>
        </div>
      </Card>
    );
  }

  if (!stats.isConnected) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-semibold mb-2">E-Mail Integration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Verbinden Sie Ihr Microsoft 365 Konto, um E-Mails automatisch mit Kontakten zu synchronisieren.
            </p>
          </div>
          <MS365ConnectButton />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <h3 className="font-semibold">Meine E-Mails</h3>
        </div>
        <MS365ConnectButton />
      </div>

      {stats.emailAddress && (
        <div className="text-sm text-muted-foreground mb-4">
          Verbunden mit: {stats.emailAddress}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Inbox className="h-3 w-3" />
            <span>Gesamt</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalEmails}</div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Mail className="h-3 w-3" />
            <span>Ungelesen</span>
          </div>
          <div className="text-2xl font-bold">
            {stats.unreadEmails}
            {stats.unreadEmails > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Neu
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="h-3 w-3" />
            <span>Heute</span>
          </div>
          <div className="text-2xl font-bold">{stats.todayEmails}</div>
        </div>
      </div>
    </Card>
  );
};
