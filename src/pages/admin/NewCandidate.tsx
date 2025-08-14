import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Skill {
  name: string;
  level: number;
  years_used: number;
  last_used: string;
}

interface Experience {
  title: string;
  org_name: string;
  start_date: string;
  end_date: string;
  summary: string;
  tech_stack: string[];
}

interface Language {
  lang_code: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

interface Link {
  label: string;
  url: string;
}

export default function NewCandidate() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Basic candidate data
  const [formData, setFormData] = useState({
    primary_role: '',
    seniority: '' as 'junior' | 'mid' | 'senior' | 'lead',
    years_experience: '',
    headline: '',
    bio: '',
    availability: '' as 'immediately' | 'notice_period' | 'booked' | 'paused',
    hours_per_week_pref: '',
    start_earliest: '',
    notice_period_days: '',
    currency: 'EUR',
    rate_hourly_target: '',
    rate_monthly_target: '',
  });

  // Identity data
  const [identity, setIdentity] = useState({
    first_name: '',
    last_name: '',
    country: '',
    city: '',
  });

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Languages
  const [languages, setLanguages] = useState<Language[]>([]);

  // Links
  const [links, setLinks] = useState<Link[]>([]);

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 1, years_used: 0, last_used: '' }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkills(updatedSkills);
  };

  const addExperience = () => {
    setExperiences([...experiences, { 
      title: '', 
      org_name: '', 
      start_date: '', 
      end_date: '', 
      summary: '', 
      tech_stack: [] 
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string | string[]) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value };
    setExperiences(updatedExperiences);
  };

  const addLanguage = () => {
    setLanguages([...languages, { lang_code: '', proficiency: 'basic' }]);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const updatedLanguages = [...languages];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    setLanguages(updatedLanguages);
  };

  const addLink = () => {
    setLinks([...links, { label: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof Link, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create candidate
      const candidateData = {
        ...formData,
        years_experience: formData.years_experience ? parseFloat(formData.years_experience) : null,
        hours_per_week_pref: formData.hours_per_week_pref ? parseInt(formData.hours_per_week_pref) : null,
        notice_period_days: formData.notice_period_days ? parseInt(formData.notice_period_days) : null,
        rate_hourly_target: formData.rate_hourly_target ? parseFloat(formData.rate_hourly_target) : null,
        rate_monthly_target: formData.rate_monthly_target ? parseFloat(formData.rate_monthly_target) : null,
        start_earliest: formData.start_earliest || null,
        skills: skills.length > 0 ? JSON.parse(JSON.stringify(skills)) : [],
        attributes: {},
      };

      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert(candidateData)
        .select()
        .single();

      if (candidateError) throw candidateError;

      // Create identity
      if (identity.first_name || identity.last_name) {
        const { error: identityError } = await supabase
          .from('candidate_identity')
          .insert({
            candidate_id: candidate.id,
            ...identity,
          });

        if (identityError) throw identityError;
      }

      // Create languages
      if (languages.length > 0) {
        const languageData = languages
          .filter(lang => lang.lang_code && lang.proficiency)
          .map(lang => ({
            candidate_id: candidate.id,
            ...lang,
          }));

        if (languageData.length > 0) {
          const { error: languageError } = await supabase
            .from('candidate_languages')
            .insert(languageData);

          if (languageError) throw languageError;
        }
      }

      // Create experiences
      if (experiences.length > 0) {
        const experienceData = experiences
          .filter(exp => exp.title)
          .map(exp => ({
            candidate_id: candidate.id,
            ...exp,
            start_date: exp.start_date || null,
            end_date: exp.end_date || null,
            tech_stack: exp.tech_stack.length > 0 ? exp.tech_stack : null,
          }));

        if (experienceData.length > 0) {
          const { error: experienceError } = await supabase
            .from('candidate_experience')
            .insert(experienceData);

          if (experienceError) throw experienceError;
        }
      }

      // Create links
      if (links.length > 0) {
        const linkData = links
          .filter(link => link.url)
          .map(link => ({
            candidate_id: candidate.id,
            ...link,
          }));

        if (linkData.length > 0) {
          const { error: linkError } = await supabase
            .from('candidate_links')
            .insert(linkData);

          if (linkError) throw linkError;
        }
      }

      toast({
        title: "Erfolg",
        description: "RaaS Ressource wurde erfolgreich angelegt.",
      });

      navigate('/admin/candidates');
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast({
        title: "Fehler",
        description: "RaaS Ressource konnte nicht angelegt werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/candidates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <h1 className="text-2xl font-bold">Neue RaaS Ressource anlegen</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Vorname</Label>
                <Input
                  id="first_name"
                  value={identity.first_name}
                  onChange={(e) => setIdentity({ ...identity, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Nachname</Label>
                <Input
                  id="last_name"
                  value={identity.last_name}
                  onChange={(e) => setIdentity({ ...identity, last_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="primary_role">Primäre Rolle *</Label>
              <Input
                id="primary_role"
                value={formData.primary_role}
                onChange={(e) => setFormData({ ...formData, primary_role: e.target.value })}
                required
                placeholder="z.B. Customer Support, Full-Stack Developer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seniority">Seniority Level</Label>
                <Select 
                  value={formData.seniority} 
                  onValueChange={(value) => setFormData({ ...formData, seniority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seniority auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="years_experience">Jahre Erfahrung</Label>
                <Input
                  id="years_experience"
                  type="number"
                  step="0.1"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="Kurzer Pitch in einem Satz"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Längere Beschreibung der RaaS Ressource"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Standort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Land</Label>
                <Input
                  id="country"
                  value={identity.country}
                  onChange={(e) => setIdentity({ ...identity, country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  value={identity.city}
                  onChange={(e) => setIdentity({ ...identity, city: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability & Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Verfügbarkeit & Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availability">Verfügbarkeit</Label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(value) => setFormData({ ...formData, availability: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Verfügbarkeit auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Sofort verfügbar</SelectItem>
                    <SelectItem value="notice_period">Kündigungsfrist</SelectItem>
                    <SelectItem value="booked">Gebucht</SelectItem>
                    <SelectItem value="paused">Pausiert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hours_per_week_pref">Wochenstunden (Wunsch)</Label>
                <Input
                  id="hours_per_week_pref"
                  type="number"
                  value={formData.hours_per_week_pref}
                  onChange={(e) => setFormData({ ...formData, hours_per_week_pref: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_earliest">Frühester Start</Label>
                <Input
                  id="start_earliest"
                  type="date"
                  value={formData.start_earliest}
                  onChange={(e) => setFormData({ ...formData, start_earliest: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notice_period_days">Kündigungsfrist (Tage)</Label>
                <Input
                  id="notice_period_days"
                  type="number"
                  value={formData.notice_period_days}
                  onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currency">Währung</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rate_monthly_target">Monatssatz (Ziel) *</Label>
                <Input
                  id="rate_monthly_target"
                  type="number"
                  step="0.01"
                  value={formData.rate_monthly_target}
                  onChange={(e) => {
                    const monthlyRate = e.target.value;
                    const hourlyRate = monthlyRate ? Math.round((parseFloat(monthlyRate) / 160) * 100) / 100 : '';
                    setFormData({ 
                      ...formData, 
                      rate_monthly_target: monthlyRate,
                      rate_hourly_target: hourlyRate.toString()
                    });
                  }}
                  placeholder="z.B. 8000"
                />
              </div>
              <div>
                <Label htmlFor="rate_hourly_target">Stundensatz (automatisch berechnet)</Label>
                <Input
                  id="rate_hourly_target"
                  type="number"
                  step="0.01"
                  value={formData.rate_hourly_target}
                  disabled
                  placeholder="Wird automatisch berechnet (Monatssatz ÷ 160h)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Skills
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-end">
                  <div>
                    <Label>Skill Name</Label>
                    <Input
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder="z.B. React"
                    />
                  </div>
                  <div>
                    <Label>Level (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Jahre verwendet</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={skill.years_used}
                      onChange={(e) => updateSkill(index, 'years_used', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Zuletzt verwendet</Label>
                    <Input
                      type="date"
                      value={skill.last_used}
                      onChange={(e) => updateSkill(index, 'last_used', e.target.value)}
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeSkill(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sprachen
              <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {languages.map((language, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>Sprache (Code)</Label>
                    <Input
                      value={language.lang_code}
                      onChange={(e) => updateLanguage(index, 'lang_code', e.target.value)}
                      placeholder="z.B. de, en, es"
                    />
                  </div>
                  <div>
                    <Label>Niveau</Label>
                    <Select 
                      value={language.proficiency} 
                      onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="fluent">Fluent</SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeLanguage(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience & Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Berufserfahrung & Projekte
              <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {experiences.map((experience, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Erfahrung #{index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeExperience(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Position/Rolle *</Label>
                      <Input
                        value={experience.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        placeholder="z.B. Senior Developer, Customer Support Manager"
                      />
                    </div>
                    <div>
                      <Label>Unternehmen/Organisation</Label>
                      <Input
                        value={experience.org_name}
                        onChange={(e) => updateExperience(index, 'org_name', e.target.value)}
                        placeholder="z.B. Tech GmbH, Freelance"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Datum</Label>
                      <Input
                        type="date"
                        value={experience.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Datum (leer = aktuell)</Label>
                      <Input
                        type="date"
                        value={experience.end_date}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Beschreibung & Aufgaben</Label>
                    <Textarea
                      value={experience.summary}
                      onChange={(e) => updateExperience(index, 'summary', e.target.value)}
                      placeholder="Kurze Beschreibung der Tätigkeiten und Verantwortlichkeiten..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Tech Stack / Verwendete Tools</Label>
                    <Input
                      value={experience.tech_stack.join(', ')}
                      onChange={(e) => updateExperience(index, 'tech_stack', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      placeholder="z.B. React, Node.js, PostgreSQL, Docker (kommagetrennt)"
                    />
                  </div>
                </div>
              ))}
              
              {experiences.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Berufserfahrung hinzugefügt. Klicken Sie auf das Plus-Symbol, um zu beginnen.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Links & Portfolio
              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(index, 'label', e.target.value)}
                      placeholder="z.B. GitHub, Portfolio"
                    />
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => removeLink(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/candidates')}
          >
            Abbrechen
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Wird angelegt...' : 'RaaS Ressource anlegen'}
          </Button>
        </div>
      </form>
    </div>
  );
}