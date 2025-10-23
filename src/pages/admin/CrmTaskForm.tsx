import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const taskSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'waiting', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.date().optional(),
  assigned_to: z.string().optional(),
  contact_id: z.string().optional(),
  company_id: z.string().optional(),
  campaign_id: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface Company {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  name: string;
}

export default function CrmTaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
    },
  });

  useEffect(() => {
    fetchDropdownData();
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const [usersRes, contactsRes, companiesRes, campaignsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, first_name, last_name'),
        supabase.from('crm_contacts').select('id, first_name, last_name').order('first_name'),
        supabase.from('crm_companies').select('id, name').order('name'),
        supabase.from('outreach_campaigns').select('id, name').order('name'),
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (contactsRes.data) setContacts(contactsRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
      if (campaignsRes.data) setCampaigns(campaignsRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast.error('Fehler beim Laden der Daten');
    }
  };

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          title: data.title,
          description: data.description || "",
          status: data.status as any,
          priority: data.priority as any,
          due_date: data.due_date ? new Date(data.due_date) : undefined,
          assigned_to: data.assigned_to || undefined,
          contact_id: data.contact_id || undefined,
          company_id: data.company_id || undefined,
          campaign_id: data.campaign_id || undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Fehler beim Laden der Aufgabe');
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const taskData = {
        title: values.title,
        description: values.description,
        status: values.status,
        priority: values.priority,
        due_date: values.due_date?.toISOString(),
        assigned_to: values.assigned_to || null,
        contact_id: values.contact_id || null,
        company_id: values.company_id || null,
        campaign_id: values.campaign_id || null,
        created_by: user.id,
      };

      if (id) {
        const { error } = await supabase
          .from('crm_tasks')
          .update(taskData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Aufgabe aktualisiert');
      } else {
        const { error } = await supabase
          .from('crm_tasks')
          .insert(taskData);
        if (error) throw error;
        toast.success('Aufgabe erstellt');
      }

      navigate('/admin/crm/tasks');
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Fehler beim Speichern der Aufgabe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</CardTitle>
          <CardDescription>
            {id ? 'Bearbeiten Sie die Aufgabendetails' : 'Erstellen Sie eine neue Aufgabe'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel *</FormLabel>
                    <FormControl>
                      <Input placeholder="Aufgabentitel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Aufgabenbeschreibung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Status auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">Zu erledigen</SelectItem>
                          <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                          <SelectItem value="waiting">Wartend</SelectItem>
                          <SelectItem value="completed">Abgeschlossen</SelectItem>
                          <SelectItem value="cancelled">Abgebrochen</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorität</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Priorität auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Niedrig</SelectItem>
                          <SelectItem value="medium">Mittel</SelectItem>
                          <SelectItem value="high">Hoch</SelectItem>
                          <SelectItem value="urgent">Dringend</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fälligkeitsdatum</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: de })
                            ) : (
                              <span>Datum auswählen</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zugewiesen an</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Benutzer auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.first_name} {user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Verknüpfungen (Optional)</h3>
                
                <FormField
                  control={form.control}
                  name="contact_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontakt</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kontakt auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.first_name} {contact.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unternehmen</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unternehmen auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="campaign_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outreach-Kampagne</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kampagne auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Wird gespeichert...' : id ? 'Speichern' : 'Erstellen'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/crm/tasks')}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
