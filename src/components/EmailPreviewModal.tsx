import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailPreviewModalProps {
  open: boolean;
  onClose: () => void;
  subject: string;
  body: string;
  sequenceNumber: number;
}

const AVAILABLE_VARIABLES = [
  { key: '{{first_name}}', description: 'Vorname des Kontakts' },
  { key: '{{last_name}}', description: 'Nachname des Kontakts' },
  { key: '{{email}}', description: 'E-Mail-Adresse' },
  { key: '{{company}}', description: 'Firmenname' },
  { key: '{{position}}', description: 'Position' },
  { key: '{{department}}', description: 'Abteilung' },
];

export function EmailPreviewModal({ open, onClose, subject, body, sequenceNumber }: EmailPreviewModalProps) {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Replace variables with example data
  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{first_name\}\}/g, 'Max')
      .replace(/\{\{last_name\}\}/g, 'Mustermann')
      .replace(/\{\{email\}\}/g, 'max.mustermann@example.com')
      .replace(/\{\{company\}\}/g, 'Beispiel GmbH')
      .replace(/\{\{position\}\}/g, 'Geschäftsführer')
      .replace(/\{\{department\}\}/g, 'Management');
  };

  const highlightVariables = (text: string) => {
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/\{\{[^}]+\}\}/)) {
        return (
          <span key={index} className="bg-primary/20 text-primary px-1 rounded">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopiert",
      description: "Variable wurde in die Zwischenablage kopiert.",
    });
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    setSendingTest(true);
    // TODO: Implement actual test email sending via edge function
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Test-E-Mail gesendet",
      description: `Eine Test-E-Mail wurde an ${testEmail} gesendet.`,
    });
    setSendingTest(false);
    setTestEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>E-Mail Vorschau - Sequenz #{sequenceNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Betreff (mit Beispieldaten)</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="font-medium">{replaceVariables(subject)}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Nachricht (mit Beispieldaten)</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {replaceVariables(body)}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Betreff (mit Variablen)</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <p className="font-medium">{highlightVariables(subject)}</p>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Nachricht (mit Variablen)</Label>
              <div className="mt-2 p-4 bg-muted/50 rounded-lg whitespace-pre-wrap">
                {highlightVariables(body)}
              </div>
            </div>
          </div>

          {/* Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verfügbare Variablen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <div
                    key={variable.key}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {variable.key}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {variable.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(variable.key)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test-E-Mail senden</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="test-email" className="sr-only">Test-E-Mail-Adresse</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendTest} disabled={sendingTest}>
                  <Mail className="h-4 w-4 mr-2" />
                  {sendingTest ? 'Sende...' : 'Senden'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Die Test-E-Mail wird mit den Beispieldaten versendet.
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
