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
    title: '',
    description: '',
    location: '',
    workType: '',
    experienceLevel: '',
    budget: '',
    deadline: undefined as Date | undefined,
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    requirements: '',
    benefits: '',
    projectDuration: '',
    startDate: undefined as Date | undefined,
  });

  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState<'required' | 'preferred'>('required');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedSkills = [
    'Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras',
    'Computer Vision', 'Natural Language Processing', 'Deep Learning',
    'Machine Learning', 'Data Science', 'Big Data', 'SQL', 'NoSQL',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'R', 'Java', 'JavaScript', 'React', 'Node.js'
  ];

  const addSkill = (skill: string, type: 'required' | 'preferred') => {
    if (skill.trim() && !formData[type === 'required' ? 'requiredSkills' : 'preferredSkills'].includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        [type === 'required' ? 'requiredSkills' : 'preferredSkills']: [
          ...prev[type === 'required' ? 'requiredSkills' : 'preferredSkills'],
          skill.trim()
        ]
      }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string, type: 'required' | 'preferred') => {
    setFormData(prev => ({
      ...prev,
      [type === 'required' ? 'requiredSkills' : 'preferredSkills']: 
        prev[type === 'required' ? 'requiredSkills' : 'preferredSkills'].filter(s => s !== skill)
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

      // Parse budget into salary_min and salary_max
      let salary_min = null;
      let salary_max = null;
      if (formData.budget) {
        const budgetMatch = formData.budget.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
        if (budgetMatch) {
          salary_min = parseInt(budgetMatch[1].replace(/\./g, ''));
          salary_max = parseInt(budgetMatch[2].replace(/\./g, ''));
        }
      }

      // Create search request
      const insertData = {
        title: formData.title,
        description: formData.description || null,
        location: formData.location || null,
        employment_type: formData.workType || null,
        experience_level: formData.experienceLevel || null,
        salary_min,
        salary_max,
        requirements: formData.requirements || null,
        skills_required: formData.requiredSkills.length > 0 ? formData.requiredSkills : null,
        company_id: profile.company_id,
        created_by: user.id,
        status: 'active'
      };
      
      console.log('Insert data:', insertData);
      console.log('Employment type value:', formData.workType, 'type:', typeof formData.workType);
      
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
            Beschreiben Sie Ihre Anforderungen und finden Sie den perfekten KI-Entwickler
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grundinformationen */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
            <CardDescription>
              Allgemeine Details zu Ihrer Stellenausschreibung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel der Position *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="z.B. Senior AI Engineer für Computer Vision"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschreiben Sie das Projekt und die Aufgaben..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Arbeitsort</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="z.B. München, Remote, Hybrid"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Arbeitstyp</Label>
                <Select value={formData.workType} onValueChange={(value) => setFormData(prev => ({ ...prev, workType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Art der Anstellung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Vollzeit</SelectItem>
                    <SelectItem value="part_time">Teilzeit</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="contract">Vertrag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Erfahrungslevel</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Erfahrungslevel wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (1-3 Jahre)</SelectItem>
                    <SelectItem value="mid">Mid-Level (3-5 Jahre)</SelectItem>
                    <SelectItem value="senior">Senior (5+ Jahre)</SelectItem>
                    <SelectItem value="lead">Lead/Principal (8+ Jahre)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Budget/Gehalt</Label>
                <Input
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="z.B. 80.000 - 120.000 € oder 150 €/Stunde"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zeitrahmen */}
        <Card>
          <CardHeader>
            <CardTitle>Zeitrahmen</CardTitle>
            <CardDescription>
              Wann soll das Projekt starten und wie lange dauern?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bewerbungsschluss</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deadline ? format(formData.deadline, "dd.MM.yyyy", { locale: de }) : "Datum auswählen"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.deadline}
                      onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Projektstart</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDuration">Projektdauer</Label>
              <Input
                id="projectDuration"
                value={formData.projectDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDuration: e.target.value }))}
                placeholder="z.B. 6 Monate, 1 Jahr, Dauerhaft"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Erforderliche Skills</CardTitle>
            <CardDescription>
              Welche Fähigkeiten und Technologien sind wichtig?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skill Input */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={skillType} onValueChange={(value: 'required' | 'preferred') => setSkillType(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Erforderlich</SelectItem>
                    <SelectItem value="preferred">Bevorzugt</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Skill eingeben..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkill, skillType);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={() => addSkill(newSkill, skillType)}
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
                      onClick={() => addSkill(skill, skillType)}
                      className="text-xs"
                    >
                      + {skill}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Required Skills Display */}
            {formData.requiredSkills.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Erforderliche Skills:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'required')}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Skills Display */}
            {formData.preferredSkills.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Bevorzugte Skills:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.preferredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill, 'preferred')}
                        className="ml-2 hover:text-blue-600"
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

        {/* Zusätzliche Anforderungen */}
        <Card>
          <CardHeader>
            <CardTitle>Zusätzliche Details</CardTitle>
            <CardDescription>
              Weitere Anforderungen und Benefits für Kandidaten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Weitere Anforderungen</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="z.B. Deutsch und Englisch fließend, Reisebereitschaft, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits und Vorteile</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData(prev => ({ ...prev, benefits: e.target.value }))}
                placeholder="z.B. Homeoffice, Weiterbildungen, Firmenwagen, etc."
                rows={3}
              />
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
            disabled={isSubmitting || !formData.title || !formData.description}
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