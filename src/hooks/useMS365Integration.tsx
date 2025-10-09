import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMS365Integration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("ms365_tokens")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking MS365 connection:", error);
      }

      setIsConnected(!!data);
    } catch (error) {
      console.error("Error checking MS365 connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToMS365 = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sie müssen angemeldet sein");
        return;
      }

      // Call edge function to get OAuth URL
      const { data, error } = await supabase.functions.invoke("ms365-oauth-start", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Error starting OAuth:", error);
        toast.error("Fehler beim Verbinden mit Microsoft 365");
        return;
      }

      if (data?.authUrl) {
        // Redirect to Microsoft OAuth
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Error connecting to MS365:", error);
      toast.error("Fehler beim Verbinden mit Microsoft 365");
    }
  };

  const disconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("ms365_tokens")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Error disconnecting:", error);
        toast.error("Fehler beim Trennen der Verbindung");
        return;
      }

      setIsConnected(false);
      toast.success("Microsoft 365 Verbindung getrennt");
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Fehler beim Trennen der Verbindung");
    }
  };

  return {
    isConnected,
    isLoading,
    connectToMS365,
    disconnect,
    refreshStatus: checkConnection,
  };
};
