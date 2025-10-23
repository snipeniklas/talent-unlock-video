import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface CrmTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  created_by: string;
  contact_id?: string;
  company_id?: string;
  campaign_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  assigned_to_profile?: {
    first_name: string;
    last_name: string;
  };
  created_by_profile?: {
    first_name: string;
    last_name: string;
  };
  contact?: {
    first_name: string;
    last_name: string;
  };
  company?: {
    name: string;
  };
  campaign?: {
    name: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'todo': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'in_progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'waiting': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const statusLabels: Record<string, string> = {
  todo: 'Zu erledigen',
  in_progress: 'In Bearbeitung',
  waiting: 'Wartend',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen'
};

const priorityLabels: Record<string, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  urgent: 'Dringend'
};

export default function CrmTaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState<CrmTask | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTask = async () => {
    if (!id) return;

    try {
      const { data: taskData, error: taskError } = await supabase
        .from('crm_tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (taskError) throw taskError;

      // Fetch related data
      const [profilesRes, contactRes, companyRes, campaignRes] = await Promise.all([
        supabase.from('profiles').select('user_id, first_name, last_name'),
        taskData.contact_id 
          ? supabase.from('crm_contacts').select('id, first_name, last_name').eq('id', taskData.contact_id).single()
          : Promise.resolve({ data: null }),
        taskData.company_id
          ? supabase.from('crm_companies').select('id, name').eq('id', taskData.company_id).single()
          : Promise.resolve({ data: null }),
        taskData.campaign_id
          ? supabase.from('outreach_campaigns').select('id, name').eq('id', taskData.campaign_id).single()
          : Promise.resolve({ data: null })
      ]);

      const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);

      const enrichedTask = {
        ...taskData,
        assigned_to_profile: taskData.assigned_to ? profilesMap.get(taskData.assigned_to) : undefined,
        created_by_profile: taskData.created_by ? profilesMap.get(taskData.created_by) : undefined,
        contact: contactRes.data || undefined,
        company: companyRes.data || undefined,
        campaign: campaignRes.data || undefined
      } as CrmTask;

      setTask(enrichedTask);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Fehler beim Laden der Aufgabe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleComplete = async () => {
    if (!task) return;

    try {
      const { error } = await supabase
        .from('crm_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;
      toast.success('Aufgabe als abgeschlossen markiert');
      fetchTask();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Fehler beim Aktualisieren der Aufgabe');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Lädt...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Aufgabe nicht gefunden</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/crm/tasks')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-muted-foreground">Aufgabendetails</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/admin/crm/tasks/${task.id}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Bearbeiten
        </Button>
      </div>

      <div className="flex gap-3">
        <Badge variant="outline" className={getStatusColor(task.status)}>
          {statusLabels[task.status]}
        </Badge>
        <Badge variant="outline" className={getPriorityColor(task.priority)}>
          {priorityLabels[task.priority]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Beschreibung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {task.description || 'Keine Beschreibung vorhanden'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fällig am</p>
              <p className="text-sm">
                {task.due_date 
                  ? new Date(task.due_date).toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Zugewiesen an</p>
              <p className="text-sm">
                {task.assigned_to_profile 
                  ? `${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Erstellt von</p>
              <p className="text-sm">
                {task.created_by_profile 
                  ? `${task.created_by_profile.first_name} ${task.created_by_profile.last_name}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Erstellt am</p>
              <p className="text-sm">
                {new Date(task.created_at).toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aktualisiert am</p>
              <p className="text-sm">
                {new Date(task.updated_at).toLocaleDateString('de-DE', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            {task.completed_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abgeschlossen am</p>
                <p className="text-sm">
                  {new Date(task.completed_at).toLocaleDateString('de-DE', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verknüpfungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {task.contact && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kontakt:</span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(`/admin/crm/contacts/${task.contact_id}`)}
              >
                {task.contact.first_name} {task.contact.last_name}
              </Button>
            </div>
          )}
          {task.company && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unternehmen:</span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(`/admin/crm/companies/${task.company_id}`)}
              >
                {task.company.name}
              </Button>
            </div>
          )}
          {task.campaign && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Kampagne:</span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(`/admin/outreach/campaigns/${task.campaign_id}`)}
              >
                {task.campaign.name}
              </Button>
            </div>
          )}
          {!task.contact && !task.company && !task.campaign && (
            <p className="text-sm text-muted-foreground">Keine Verknüpfungen vorhanden</p>
          )}
        </CardContent>
      </Card>

      {task.status !== 'completed' && (
        <div className="flex justify-end">
          <Button onClick={handleComplete} variant="default">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Als erledigt markieren
          </Button>
        </div>
      )}
    </div>
  );
}
