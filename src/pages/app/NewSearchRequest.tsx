import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, X, Plus, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const NewSearchRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    customerIndustry: '',
    numberOfWorkers: 1,
    jobTitle: '',
    workAreas: [] as string[],
    experienceLevel: '',
    weeklyHours: 40,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    requirements: [] as string[],
    skills: [] as string[],
    mainTasks: [] as string[],
  });

  const [newWorkArea, setNewWorkArea] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newMainTask, setNewMainTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedWorkAreas = [
    'IT-Support', 'Mahnwesen', 'Buchhaltung', 'Kundenservice', 'Datenverarbeitung',
    'Qualitätssicherung', 'Projektmanagement', 'Marketing', 'Vertrieb'
  ];

  const predefinedSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'NoSQL',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum'
  ];

  const addItem = (item: string, type: 'workAreas' | 'requirements' | 'skills' | 'mainTasks') => {
    if (item.trim() && !formData[type].includes(item.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], item.trim()]
      }));
    }
    // Reset the appropriate input
    if (type === 'workAreas') setNewWorkArea('');
    if (type === 'requirements') setNewRequirement('');
    if (type === 'skills') setNewSkill('');
    if (type === 'mainTasks') setNewMainTask('');
  };

  const removeItem = (item: string, type: 'workAreas' | 'requirements' | 'skills' | 'mainTasks') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== item)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user and their company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) {
        throw new Error('No company found for user');
      }

      // Create search request with new structure
      const insertData = {
        title: `${formData.jobTitle} - ${formData.numberOfWorkers} Remote-Mitarbeiter`,
        description: `Benötigte Arbeitsbereiche: ${formData.workAreas.join(', ')}`,
        customer_industry: formData.customerIndustry || null,
        number_of_workers: formData.numberOfWorkers,
        job_title: formData.jobTitle || null,
        work_areas: formData.workAreas.length > 0 ? formData.workAreas : null,
        experience_level_new: formData.experienceLevel || null,
        weekly_hours: formData.weeklyHours,
        start_date: formData.startDate ? formData.startDate.toISOString().split('T')[0] : null,
        end_date: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null,
        requirements_list: formData.requirements.length > 0 ? formData.requirements : null,
        skills_list: formData.skills.length > 0 ? formData.skills : null,
        main_tasks: formData.mainTasks.length > 0 ? formData.mainTasks : null,
        company_id: profile.company_id,
        created_by: user.id,
        status: 'active'
      };
      
      console.log('Insert data:', insertData);
      
      const { error } = await supabase
        .from('search_requests')
        .insert(insertData);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      toast({
        title: "Suchauftrag erstellt",
        description: "Ihr Suchauftrag wurde erfolgreich erstellt und ist jetzt aktiv.",
      });
      
      navigate('/app/search-requests');
    } catch (error) {
      console.error('Error creating search request:', error);
      toast({
        title: "Fehler",
        description: "Beim Erstellen des Suchauftrags ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/app/search-requests')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Neuen Suchauftrag erstellen</h1>
          <p className="text-muted-foreground mt-1">
            Finden Sie die perfekten Remote-Mitarbeiter für Ihr Unternehmen
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grundinformationen */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
            <CardDescription>
              Allgemeine Details zu Ihrem Personalbedarf
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerIndustry">Ihre Branche *</Label>
              <Input
                id="customerIndustry"
                value={formData.customerIndustry}
                onChange={(e) => setFormData(prev => ({ ...prev, customerIndustry: e.target.value }))}
                placeholder="z.B. E-Commerce, Finanzdienstleistungen, Healthcare"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfWorkers">Anzahl der benötigten Remote-Mitarbeiter *</Label>
                <Input
                  id="numberOfWorkers"
                  type="number"
                  min="1"
                  value={formData.numberOfWorkers}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfWorkers: parseInt(e.target.value) || 1 }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Jobtitel *</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="z.B. Software-Developer, Backoffice-Mitarbeiter, KI-Spezialist"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Berufserfahrung</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Erfahrungslevel wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior_ba">Junior (BA): 1-5 Jahre</SelectItem>
                    <SelectItem value="senior_ba">Senior (BA): 5+ Jahre</SelectItem>
                    <SelectItem value="senior_ma">Senior (MA): 10+ Jahre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Wöchentliche Arbeitszeit</Label>
                <Select value={formData.weeklyHours.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, weeklyHours: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Arbeitszeit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 Stunden</SelectItem>
                    <SelectItem value="30">30 Stunden</SelectItem>
                    <SelectItem value="40">40 Stunden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arbeitszeitraum */}
        <Card>
          <CardHeader>
            <CardTitle>Arbeitszeitraum</CardTitle>
            <CardDescription>
              Wann sollen die Remote-Mitarbeiter starten und wie lange arbeiten?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wunschdatum Start</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "dd.MM.yyyy", { locale: de }) : "Datum auswählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Datum Ende (optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "dd.MM.yyyy", { locale: de }) : "Unbegrenzt"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benötigte Arbeitsbereiche */}
        <Card>
          <CardHeader>
            <CardTitle>Benötigte Arbeitsbereiche</CardTitle>
            <CardDescription>
              In welchen Bereichen sollen die Remote-Mitarbeiter tätig sein?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newWorkArea}
                onChange={(e) => setNewWorkArea(e.target.value)}
                placeholder="Arbeitsbereich eingeben..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addItem(newWorkArea, 'workAreas');
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={() => addItem(newWorkArea, 'workAreas')}
                disabled={!newWorkArea.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Predefined Work Areas */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Häufige Arbeitsbereiche:</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedWorkAreas.map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(area, 'workAreas')}
                    className="text-xs"
                  >
                    + {area}
                  </Button>
                ))}
              </div>
            </div>

            {/* Work Areas Display */}
            {formData.workAreas.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Ausgewählte Arbeitsbereiche:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.workAreas.map((area) => (
                    <Badge key={area} variant="default">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeItem(area, 'workAreas')}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anforderungen, Skills und Hauptaufgaben */}
        <Card>
          <CardHeader>
            <CardTitle>Detaillierte Anforderungen</CardTitle>
            <CardDescription>
              Spezifizieren Sie Anforderungen, Skills und Hauptaufgaben
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Anforderungen */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Anforderungen</Label>
              <div className="flex gap-2">
                <Input
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  placeholder="Anforderung eingeben..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(newRequirement, 'requirements');
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={() => addItem(newRequirement, 'requirements')}
                  disabled={!newRequirement.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((req) => (
                    <Badge key={req} variant="default" className="bg-orange-100 text-orange-800">
                      {req}
                      <button
                        type="button"
                        onClick={() => removeItem(req, 'requirements')}
                        className="ml-2 hover:text-orange-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Skill eingeben..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(newSkill, 'skills');
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={() => addItem(newSkill, 'skills')}
                  disabled={!newSkill.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Predefined Skills */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Häufige Skills:</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedSkills.map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addItem(skill, 'skills')}
                      className="text-xs"
                    >
                      + {skill}
                    </Button>
                  ))}
                </div>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="default" className="bg-blue-100 text-blue-800">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeItem(skill, 'skills')}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Hauptaufgaben */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Hauptaufgaben</Label>
              <div className="flex gap-2">
                <Input
                  value={newMainTask}
                  onChange={(e) => setNewMainTask(e.target.value)}
                  placeholder="Hauptaufgabe eingeben..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem(newMainTask, 'mainTasks');
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={() => addItem(newMainTask, 'mainTasks')}
                  disabled={!newMainTask.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.mainTasks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.mainTasks.map((task) => (
                    <Badge key={task} variant="default" className="bg-green-100 text-green-800">
                      {task}
                      <button
                        type="button"
                        onClick={() => removeItem(task, 'mainTasks')}
                        className="ml-2 hover:text-green-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/app/search-requests')}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary-hover"
            disabled={isSubmitting || !formData.customerIndustry || !formData.jobTitle}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Wird erstellt..." : "Suchauftrag erstellen"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewSearchRequest;