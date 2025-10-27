import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle2, Clock, Edit, FileText, ListChecks, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface ContactActivitiesSectionProps {
  contactId: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  completed_at: string | null;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface Note {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export function ContactActivitiesSection({ contactId }: ContactActivitiesSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch all users for assignment dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .order('first_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch tasks for this contact
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['contact-tasks', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch profiles for assigned_to users
      const taskData = data || [];
      const userIds = [...new Set(taskData.map(t => t.assigned_to).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        return taskData.map(task => ({
          ...task,
          profiles: task.assigned_to ? profilesMap.get(task.assigned_to) : undefined
        })) as Task[];
      }

      return taskData as Task[];
    },
  });

  // Fetch notes for this contact
  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['contact-notes', contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch profiles for created_by users
      const noteData = data || [];
      const userIds = [...new Set(noteData.map(n => n.created_by).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', userIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        
        return noteData.map(note => ({
          ...note,
          profiles: note.created_by ? profilesMap.get(note.created_by) : undefined
        })) as Note[];
      }

      return noteData as Note[];
    },
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assigned_to: currentUser?.id || '',
  });

  // Note form state
  const [noteForm, setNoteForm] = useState({
    content: '',
  });

  // Create/Update Task Mutation
  const taskMutation = useMutation({
    mutationFn: async (data: typeof taskForm & { id?: string }) => {
      if (data.id) {
        // Update existing task
        const { error } = await supabase
          .from('crm_tasks')
          .update({
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            due_date: data.due_date || null,
            assigned_to: data.assigned_to,
          })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        // Create new task
        const { error } = await supabase
          .from('crm_tasks')
          .insert({
            contact_id: contactId,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            due_date: data.due_date || null,
            assigned_to: data.assigned_to,
            created_by: currentUser?.id,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-tasks', contactId] });
      setTaskDialogOpen(false);
      setEditingTask(null);
      setTaskForm({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        assigned_to: currentUser?.id || '',
      });
      toast({
        title: editingTask ? "Aufgabe aktualisiert" : "Aufgabe erstellt",
        description: editingTask 
          ? "Die Aufgabe wurde erfolgreich aktualisiert." 
          : "Die Aufgabe wurde erfolgreich erstellt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Speichern der Aufgabe.",
        variant: "destructive",
      });
    },
  });

  // Create/Update Note Mutation
  const noteMutation = useMutation({
    mutationFn: async (data: typeof noteForm & { id?: string }) => {
      if (data.id) {
        // Update existing note
        const { error } = await supabase
          .from('crm_contact_notes')
          .update({
            content: data.content,
          })
          .eq('id', data.id);
        
        if (error) throw error;
      } else {
        // Create new note
        const { error } = await supabase
          .from('crm_contact_notes')
          .insert({
            contact_id: contactId,
            content: data.content,
            created_by: currentUser?.id,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-notes', contactId] });
      setNoteDialogOpen(false);
      setEditingNote(null);
      setNoteForm({ content: '' });
      toast({
        title: editingNote ? "Notiz aktualisiert" : "Notiz erstellt",
        description: editingNote 
          ? "Die Notiz wurde erfolgreich aktualisiert." 
          : "Die Notiz wurde erfolgreich erstellt.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Fehler beim Speichern der Notiz.",
        variant: "destructive",
      });
    },
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
      assigned_to: task.assigned_to || currentUser?.id || '',
    });
    setTaskDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({ content: note.content });
    setNoteDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (editingTask) {
      taskMutation.mutate({ ...taskForm, id: editingTask.id });
    } else {
      taskMutation.mutate(taskForm);
    }
  };

  const handleSaveNote = () => {
    if (editingNote) {
      noteMutation.mutate({ ...noteForm, id: editingNote.id });
    } else {
      noteMutation.mutate(noteForm);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      done: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      todo: 'Zu erledigen',
      in_progress: 'In Bearbeitung',
      done: 'Erledigt',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Niedrig',
      medium: 'Mittel',
      high: 'Hoch',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  // Combine tasks and notes into a single timeline
  const activities = [
    ...(tasks || []).map(task => ({
      type: 'task' as const,
      id: task.id,
      data: task,
      timestamp: task.created_at,
    })),
    ...(notes || []).map(note => ({
      type: 'note' as const,
      id: note.id,
      data: note,
      timestamp: note.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Allgemeine Aktivitäten
            </CardTitle>
            <CardDescription>
              Aufgaben und Notizen für diesen Kontakt
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={taskDialogOpen} onOpenChange={(open) => {
              setTaskDialogOpen(open);
              if (!open) {
                setEditingTask(null);
                setTaskForm({
                  title: '',
                  description: '',
                  status: 'todo',
                  priority: 'medium',
                  due_date: '',
                  assigned_to: currentUser?.id || '',
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Aufgabe
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</DialogTitle>
                  <DialogDescription>
                    {editingTask ? 'Bearbeiten Sie die Aufgabendetails' : 'Erstellen Sie eine neue Aufgabe für diesen Kontakt'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Titel *</Label>
                    <Input
                      id="task-title"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="Aufgabentitel eingeben"
                    />
                  </div>
                  <div>
                    <Label htmlFor="task-description">Beschreibung</Label>
                    <Textarea
                      id="task-description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Aufgabenbeschreibung eingeben"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-status">Status</Label>
                      <Select value={taskForm.status} onValueChange={(value) => setTaskForm({ ...taskForm, status: value })}>
                        <SelectTrigger id="task-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">Zu erledigen</SelectItem>
                          <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                          <SelectItem value="done">Erledigt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="task-priority">Priorität</Label>
                      <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                        <SelectTrigger id="task-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Niedrig</SelectItem>
                          <SelectItem value="medium">Mittel</SelectItem>
                          <SelectItem value="high">Hoch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-due-date">Fälligkeitsdatum</Label>
                      <Input
                        id="task-due-date"
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-assigned-to">Zugewiesen an</Label>
                      <Select value={taskForm.assigned_to} onValueChange={(value) => setTaskForm({ ...taskForm, assigned_to: value })}>
                        <SelectTrigger id="task-assigned-to">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map(user => (
                            <SelectItem key={user.user_id} value={user.user_id}>
                              {user.first_name} {user.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleSaveTask} disabled={!taskForm.title}>
                      {editingTask ? 'Aktualisieren' : 'Erstellen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={noteDialogOpen} onOpenChange={(open) => {
              setNoteDialogOpen(open);
              if (!open) {
                setEditingNote(null);
                setNoteForm({ content: '' });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Notiz
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingNote ? 'Notiz bearbeiten' : 'Neue Notiz'}</DialogTitle>
                  <DialogDescription>
                    {editingNote ? 'Bearbeiten Sie die Notiz' : 'Erstellen Sie eine neue Notiz für diesen Kontakt'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="note-content">Notiz *</Label>
                    <Textarea
                      id="note-content"
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ content: e.target.value })}
                      placeholder="Notizinhalt eingeben"
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleSaveNote} disabled={!noteForm.content}>
                      {editingNote ? 'Aktualisieren' : 'Erstellen'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasksLoading || notesLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse h-20 bg-muted rounded"></div>
            <div className="animate-pulse h-20 bg-muted rounded"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Noch keine Aktivitäten vorhanden
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                {activity.type === 'task' ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-semibold">{activity.data.title}</h4>
                        </div>
                        {activity.data.description && (
                          <p className="text-sm text-muted-foreground pl-6">{activity.data.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 pl-6">
                          <Badge className={getStatusColor(activity.data.status)}>
                            {getStatusLabel(activity.data.status)}
                          </Badge>
                          <Badge className={getPriorityColor(activity.data.priority)}>
                            {getPriorityLabel(activity.data.priority)}
                          </Badge>
                          {activity.data.due_date && (
                            <Badge variant="outline" className="gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(activity.data.due_date), 'dd.MM.yyyy')}
                            </Badge>
                          )}
                          {activity.data.profiles && (
                            <Badge variant="outline" className="gap-1">
                              <User className="h-3 w-3" />
                              {activity.data.profiles.first_name} {activity.data.profiles.last_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditTask(activity.data)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6">
                      <Clock className="h-3 w-3" />
                      Erstellt am {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm')}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="font-semibold">Notiz</h4>
                        </div>
                        <p className="text-sm whitespace-pre-wrap pl-6">{activity.data.content}</p>
                        {activity.data.profiles && (
                          <div className="flex items-center gap-2 pl-6">
                            <Badge variant="outline" className="gap-1">
                              <User className="h-3 w-3" />
                              {activity.data.profiles.first_name} {activity.data.profiles.last_name}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditNote(activity.data)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6">
                      <Clock className="h-3 w-3" />
                      Erstellt am {format(new Date(activity.timestamp), 'dd.MM.yyyy HH:mm')}
                      {activity.data.updated_at && activity.data.updated_at !== activity.data.created_at && (
                        <> • Bearbeitet am {format(new Date(activity.data.updated_at), 'dd.MM.yyyy HH:mm')}</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
