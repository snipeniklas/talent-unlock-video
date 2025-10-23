import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Building, Briefcase, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ContactDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  contact: any;
  sentEmails: any[];
}

export function ContactDetailDrawer({ open, onClose, contact, sentEmails }: ContactDetailDrawerProps) {
  const navigate = useNavigate();

  if (!contact) return null;

  const crmContact = contact.crm_contacts;
  const contactSentEmails = sentEmails.filter((email: any) => email.contact_id === contact.contact_id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-500';
      case 'replied':
        return 'bg-blue-500';
      case 'bounced':
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {crmContact.first_name} {crmContact.last_name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kontaktinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {crmContact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmContact.email}</span>
                </div>
              )}
              {crmContact.position && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmContact.position}</span>
                </div>
              )}
              {crmContact.department && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{crmContact.department}</span>
                </div>
              )}
              {crmContact.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{crmContact.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kampagnenstatus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(contact.status)}>
                  {contact.status}
                </Badge>
              </div>
              {contact.next_sequence_number && contact.status !== 'completed' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Nächste E-Mail:</span>
                  <Badge variant="outline">#{contact.next_sequence_number}</Badge>
                </div>
              )}
              {contact.next_send_date && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Nächstes Sendedatum:</span>
                  <span className="text-sm">
                    {new Date(contact.next_send_date).toLocaleString('de-DE')}
                  </span>
                </div>
              )}
              {contact.is_excluded && (
                <Badge variant="destructive">Ausgeschlossen</Badge>
              )}
            </CardContent>
          </Card>

          {/* Sent Emails */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Versendete E-Mails ({contactSentEmails.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactSentEmails.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine E-Mails versendet
                </p>
              ) : (
                <div className="space-y-3">
                  {contactSentEmails.map((email: any) => (
                    <div
                      key={email.id}
                      className="p-3 rounded-lg border bg-card space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium flex-1">{email.subject}</p>
                        <Badge className={getStatusColor(email.status)} variant="outline">
                          {email.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(email.sent_at).toLocaleString('de-DE')}
                      </p>
                      {email.error_message && (
                        <p className="text-xs text-destructive">
                          {email.error_message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CRM Link */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              navigate(`/admin/crm/contacts/${crmContact.id}`);
              onClose();
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Im CRM öffnen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
