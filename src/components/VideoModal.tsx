import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { X, Mail, Phone, Shield } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUnlock: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, onVideoUnlock }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedPrivacy) {
      toast({
        title: "Datenschutzerklärung erforderlich",
        description: "Bitte akzeptieren Sie die Datenschutzerklärung.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate webhook call (replace with actual webhook URL)
      const webhookResponse = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          timestamp: new Date().toISOString(),
          source: 'video-leadmagnet'
        }),
      });

      // GTM DataLayer event
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'video_unlocked',
          email: email,
          timestamp: new Date().toISOString()
        });
      }

      toast({
        title: "Vielen Dank!",
        description: "Das Video wird jetzt freigeschaltet.",
      });

      onVideoUnlock();
      onClose();
    } catch (error) {
      console.error('Webhook error:', error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-brand-dark">
            Video jetzt freischalten
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Geben Sie Ihre E-Mail-Adresse ein, um das exklusive Video zu sehen
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-Mail-Adresse *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre.email@beispiel.de"
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Telefonnummer (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 123 456789"
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="privacy"
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
              Ich habe die{' '}
              <a href="/datenschutz" className="text-primary hover:underline" target="_blank">
                Datenschutzerklärung
              </a>{' '}
              gelesen und akzeptiere diese. Ich bin damit einverstanden, dass meine Daten zur Bearbeitung 
              meiner Anfrage gespeichert und verarbeitet werden.
            </Label>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Ihre Daten sind bei uns sicher und werden nicht an Dritte weitergegeben.
            </span>
          </div>

          <Button
            type="submit"
            variant="cta"
            size="xl"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Video wird freigeschaltet...' : 'Video jetzt freischalten'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};