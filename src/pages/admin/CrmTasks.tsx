import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, ColumnDef, FilterDef } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function CrmTasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<CrmTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('crm_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch all profiles, contacts, companies, and campaigns separately
      const [profilesRes, contactsRes, companiesRes, campaignsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, first_name, last_name'),
        supabase.from('crm_contacts').select('id, first_name, last_name'),
        supabase.from('crm_companies').select('id, name'),
        supabase.from('outreach_campaigns').select('id, name')
      ]);

      // Create lookup maps
      const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);
      const contactsMap = new Map(contactsRes.data?.map(c => [c.id, c]) || []);
      const companiesMap = new Map(companiesRes.data?.map(c => [c.id, c]) || []);
      const campaignsMap = new Map(campaignsRes.data?.map(c => [c.id, c]) || []);

      // Enrich tasks with related data
      const enrichedTasks = tasksData?.map(task => ({
        ...task,
        assigned_to_profile: task.assigned_to ? profilesMap.get(task.assigned_to) : null,
        created_by_profile: task.created_by ? profilesMap.get(task.created_by) : null,
        contact: task.contact_id ? contactsMap.get(task.contact_id) : null,
        company: task.company_id ? companiesMap.get(task.company_id) : null,
        campaign: task.campaign_id ? campaignsMap.get(task.campaign_id) : null
      })) || [];

      setTasks(enrichedTasks as any);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Fehler beim Laden der Aufgaben');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('crm_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      toast.success('Aufgabe als abgeschlossen markiert');
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Fehler beim Aktualisieren der Aufgabe');
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    try {
      const { error } = await supabase
        .from('crm_tasks')
        .delete()
        .eq('id', taskToDelete);

      if (error) throw error;
      toast.success('Aufgabe gelöscht');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Fehler beim Löschen der Aufgabe');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const columns: ColumnDef<CrmTask>[] = [
    {
      id: 'title',
      header: 'Titel',
      accessorKey: 'title',
      sortable: true,
      defaultVisible: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      filterable: true,
      defaultVisible: true,
      cell: (task: CrmTask) => (
        <Badge variant="outline" className={getStatusColor(task.status)}>
          {statusLabels[task.status]}
        </Badge>
      ),
    },
    {
      id: 'priority',
      header: 'Priorität',
      accessorKey: 'priority',
      sortable: true,
      filterable: true,
      defaultVisible: true,
      cell: (task: CrmTask) => (
        <Badge variant="outline" className={getPriorityColor(task.priority)}>
          {priorityLabels[task.priority]}
        </Badge>
      ),
    },
    {
      id: 'due_date',
      header: 'Fällig am',
      accessorKey: 'due_date',
      sortable: true,
      defaultVisible: true,
      cell: (task: CrmTask) => {
        if (!task.due_date) return '-';
        const dueDate = new Date(task.due_date);
        const isOverdue = dueDate < new Date() && task.status !== 'completed';
        return (
          <span className={isOverdue ? 'text-red-500 font-semibold' : ''}>
            {new Date(task.due_date).toLocaleDateString('de-DE')}
          </span>
        );
      },
    },
    {
      id: 'assigned_to',
      header: 'Zugewiesen an',
      accessorKey: 'assigned_to',
      filterable: true,
      defaultVisible: true,
      cell: (task: CrmTask) => {
        if (!task.assigned_to_profile) return '-';
        return `${task.assigned_to_profile.first_name} ${task.assigned_to_profile.last_name}`;
      },
    },
    {
      id: 'contact',
      header: 'Kontakt',
      accessorKey: 'contact_id',
      defaultVisible: false,
      cell: (task: CrmTask) => {
        if (!task.contact) return '-';
        return (
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => navigate(`/admin/crm/contacts/${task.contact_id}`)}
          >
            {task.contact.first_name} {task.contact.last_name}
          </Button>
        );
      },
    },
    {
      id: 'company',
      header: 'Unternehmen',
      accessorKey: 'company_id',
      defaultVisible: false,
      cell: (task: CrmTask) => {
        if (!task.company) return '-';
        return (
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => navigate(`/admin/crm/companies/${task.company_id}`)}
          >
            {task.company.name}
          </Button>
        );
      },
    },
    {
      id: 'campaign',
      header: 'Kampagne',
      accessorKey: 'campaign_id',
      defaultVisible: false,
      cell: (task: CrmTask) => {
        if (!task.campaign) return '-';
        return (
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => navigate(`/admin/outreach/campaigns/${task.campaign_id}`)}
          >
            {task.campaign.name}
          </Button>
        );
      },
    },
    {
      id: 'created_at',
      header: 'Erstellt',
      accessorKey: 'created_at',
      sortable: true,
      defaultVisible: false,
      cell: (task: CrmTask) => formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: de }),
    },
    {
      id: 'actions',
      header: 'Aktionen',
      accessorKey: 'id',
      defaultVisible: true,
      cell: (task: CrmTask) => (
        <div className="flex gap-2">
          {task.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleComplete(task.id)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admin/crm/tasks/${task.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTaskToDelete(task.id);
              setDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filters: FilterDef[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { value: 'todo', label: 'Zu erledigen' },
        { value: 'in_progress', label: 'In Bearbeitung' },
        { value: 'waiting', label: 'Wartend' },
        { value: 'completed', label: 'Abgeschlossen' },
        { value: 'cancelled', label: 'Abgebrochen' },
      ],
    },
    {
      id: 'priority',
      label: 'Priorität',
      options: [
        { value: 'low', label: 'Niedrig' },
        { value: 'medium', label: 'Mittel' },
        { value: 'high', label: 'Hoch' },
        { value: 'urgent', label: 'Dringend' },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Aufgaben</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre CRM-Aufgaben</p>
        </div>
        <Button onClick={() => navigate('/admin/crm/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Aufgabe
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Aufgaben</CardTitle>
          <CardDescription>
            Übersicht über alle Aufgaben im System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={tasks}
            columns={columns}
            filters={filters}
            searchPlaceholder="Aufgaben durchsuchen..."
          />
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aufgabe löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Aufgabe wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
