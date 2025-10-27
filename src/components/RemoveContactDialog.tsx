import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface RemoveContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  onConfirm: (reason: RemovalReason, data?: { reply?: string; meetingDate?: Date; notes?: string }) => void;
  isLoading?: boolean;
}

export type RemovalReason = "no_contact" | "reply_received" | "meeting_booked";

export function RemoveContactDialog({ 
  open, 
  onOpenChange, 
  contactName, 
  onConfirm,
  isLoading = false 
}: RemoveContactDialogProps) {
  const [reason, setReason] = useState<RemovalReason>("no_contact");
  const [replyContent, setReplyContent] = useState("");
  const [meetingDate, setMeetingDate] = useState<Date>();
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    const data: any = {};
    
    if (reason === "reply_received" && replyContent) {
      data.reply = replyContent;
    }
    
    if (reason === "meeting_booked" && meetingDate) {
      data.meetingDate = meetingDate;
    }
    
    if (notes) {
      data.notes = notes;
    }
    
    onConfirm(reason, data);
  };

  const resetForm = () => {
    setReason("no_contact");
    setReplyContent("");
    setMeetingDate(undefined);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kontakt aus Kampagne entfernen</DialogTitle>
          <DialogDescription>
            Warum möchten Sie <strong>{contactName}</strong> aus der Kampagne entfernen?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={(value) => setReason(value as RemovalReason)}>
            <div className="flex items-start space-x-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="no_contact" id="no_contact" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="no_contact" className="cursor-pointer font-medium">
                  Keine weitere Kontaktaufnahme gewünscht
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Der Kontakt möchte nicht weiter kontaktiert werden
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="reply_received" id="reply_received" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="reply_received" className="cursor-pointer font-medium">
                  Antwort erhalten
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Der Kontakt hat geantwortet
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="meeting_booked" id="meeting_booked" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="meeting_booked" className="cursor-pointer font-medium">
                  Termin gebucht
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ein Meeting wurde vereinbart
                </p>
              </div>
            </div>
          </RadioGroup>

          {reason === "reply_received" && (
            <div className="space-y-2">
              <Label htmlFor="reply">E-Mail Antwort</Label>
              <Textarea
                id="reply"
                placeholder="Fügen Sie hier die E-Mail-Antwort des Kontakts ein..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          )}

          {reason === "meeting_booked" && (
            <div className="space-y-2">
              <Label>Termin Datum & Zeit</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !meetingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {meetingDate ? format(meetingDate, "PPP", { locale: de }) : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={meetingDate}
                    onSelect={setMeetingDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Notizen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || (reason === "reply_received" && !replyContent) || (reason === "meeting_booked" && !meetingDate)}
          >
            {isLoading ? "Entferne..." : "Aus Kampagne entfernen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
