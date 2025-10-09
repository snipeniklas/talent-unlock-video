import { Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMS365Integration } from "@/hooks/useMS365Integration";

export const MS365ConnectButton = () => {
  const { isConnected, isLoading, connectToMS365, disconnect } = useMS365Integration();

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Prüfe Verbindung...
      </Button>
    );
  }

  if (isConnected) {
    return (
      <Button variant="outline" onClick={disconnect}>
        <Check className="h-4 w-4 mr-2 text-green-600" />
        Microsoft 365 verbunden
      </Button>
    );
  }

  return (
    <Button onClick={connectToMS365}>
      <Mail className="h-4 w-4 mr-2" />
      Mit Microsoft 365 verbinden
    </Button>
  );
};
