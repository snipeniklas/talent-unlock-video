import { Mail, UserPlus, Play, Pause, CheckCircle, AlertCircle, MessageSquare, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineEvent {
  id: string;
  type: 'campaign_created' | 'campaign_started' | 'campaign_paused' | 'campaign_completed' | 
        'contact_added' | 'contact_removed' | 'contact_removed_reply' | 'contact_removed_meeting' | 
        'email_sent' | 'email_failed' | 'email_replied';
  timestamp: string;
  description: string;
  details?: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'campaign_created':
      case 'campaign_started':
        return <Play className="h-4 w-4" />;
      case 'campaign_paused':
        return <Pause className="h-4 w-4" />;
      case 'campaign_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'contact_added':
        return <UserPlus className="h-4 w-4" />;
      case 'contact_removed':
      case 'contact_removed_reply':
      case 'contact_removed_meeting':
        return <UserMinus className="h-4 w-4" />;
      case 'email_sent':
        return <Mail className="h-4 w-4" />;
      case 'email_failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'email_replied':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'campaign_created':
      case 'campaign_started':
      case 'email_sent':
        return 'bg-primary text-primary-foreground';
      case 'campaign_completed':
      case 'email_replied':
        return 'bg-green-500 text-white';
      case 'campaign_paused':
        return 'bg-yellow-500 text-white';
      case 'email_failed':
        return 'bg-destructive text-destructive-foreground';
      case 'contact_added':
        return 'bg-blue-500 text-white';
      case 'contact_removed':
        return 'bg-muted text-muted-foreground';
      case 'contact_removed_reply':
        return 'bg-blue-500 text-white';
      case 'contact_removed_meeting':
        return 'bg-green-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Noch keine Aktivitäten
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Icon & Line */}
          <div className="flex flex-col items-center">
            <div className={`rounded-full p-2 ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 flex-1 bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <Card className="flex-1">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">{event.description}</p>
                  {event.details && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.details}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
