import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Mail, MapPin, Calendar, Clock, DollarSign, Globe, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

interface Skill {
  name: string;
  level: number;
  years_used: number;
  last_used: string;
}

interface Experience {
  id: string;
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
  id: string;
  label: string;
  url: string;
}

interface Candidate {
  id: string;
  primary_role: string;
  seniority: 'junior' | 'mid' | 'senior' | 'lead';
  years_experience: number;
  headline: string;
  bio: string;
  availability: 'immediately' | 'notice_period' | 'booked' | 'paused';
  hours_per_week_pref: number;
  start_earliest: string;
  notice_period_days: number;
  currency: string;
  rate_hourly_target: number;
  rate_monthly_target: number;
  skills: Skill[];
}

interface Identity {
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  avatar_url: string;
}

export default function CandidateView() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    loadCandidateData();
  }, [id]);

  const loadCandidateData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load candidate
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single();

      if (candidateError) throw candidateError;
      
      // Handle skills type conversion
      const skillsData = candidateData.skills ? 
        (Array.isArray(candidateData.skills) ? candidateData.skills as unknown as Skill[] : []) : [];
      
      setCandidate({
        ...candidateData,
        skills: skillsData
      });

      // Load identity
      const { data: identityData } = await supabase
        .from('candidate_identity')
        .select('*')
        .eq('candidate_id', id)
        .single();

      setIdentity(identityData);

      // Load experiences with type conversion
      const { data: experienceData } = await supabase
        .from('candidate_experience')
        .select('*')
        .eq('candidate_id', id)
        .order('start_date', { ascending: false });

      if (experienceData) {
        setExperiences(experienceData.map(exp => ({
          ...exp,
          tech_stack: Array.isArray(exp.tech_stack) ? exp.tech_stack as string[] : []
        })));
      }

      // Load languages
      const { data: languageData } = await supabase
        .from('candidate_languages')
        .select('*')
        .eq('candidate_id', id);

      setLanguages(languageData || []);

      // Load links
      const { data: linkData } = await supabase
        .from('candidate_links')
        .select('*')
        .eq('candidate_id', id);

      setLinks(linkData || []);

    } catch (error) {
      console.error('Error loading candidate:', error);
      toast({
        title: "Fehler",
        description: "RaaS Ressource konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'junior': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-purple-100 text-purple-800';
      case 'lead': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'immediately': return 'bg-green-100 text-green-800';
      case 'notice_period': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = () => {
    if (!identity?.first_name && !identity?.last_name) return '?';
    const first = identity?.first_name?.charAt(0).toUpperCase() || '';
    const last = identity?.last_name?.charAt(0).toUpperCase() || '';
    return `${first}${last}`;
  };
  
  const getProficiencyLabel = (proficiency: string) => {
    const labels = {
      'basic': 'Grundkenntnisse',
      'conversational': 'Unterhaltung',
      'fluent': 'Fließend',
      'native': 'Muttersprache'
    };
    return labels[proficiency as keyof typeof labels] || proficiency;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Heute';
    return new Date(dateString).toLocaleDateString('de-DE', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Laden...</div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold">RaaS Ressource nicht gefunden</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/candidates')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarImage src={identity?.avatar_url || undefined} alt="Profilbild" />
            <AvatarFallback className="text-xl font-semibold bg-primary/10">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {identity ? `${identity.first_name} ${identity.last_name}` : 'RaaS Ressource'}
            </h1>
            <p className="text-muted-foreground">{candidate.primary_role}</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(`/admin/candidates/${id}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Bearbeiten
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Übersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getSeniorityColor(candidate.seniority)}>
                  {candidate.seniority}
                </Badge>
                <Badge className={getAvailabilityColor(candidate.availability)}>
                  {candidate.availability === 'immediately' ? 'Sofort verfügbar' : 
                   candidate.availability === 'notice_period' ? 'Kündigungsfrist' :
                   candidate.availability === 'booked' ? 'Gebucht' : 'Pausiert'}
                </Badge>
              </div>
              
              {candidate.headline && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Headline</h3>
                  <p className="text-lg font-medium">{candidate.headline}</p>
                </div>
              )}
              
              {candidate.bio && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Bio</h3>
                  <p className="text-sm leading-relaxed">{candidate.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Erfahrung</h3>
                  <p>{candidate.years_experience} Jahre</p>
                </div>
                {identity?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{identity.city}, {identity.country}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidate.skills.map((skill, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{skill.name}</h4>
                        <Badge variant="outline">Level {skill.level}/5</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Erfahrung: {skill.years_used} Jahre</div>
                        {skill.last_used && (
                          <div>Zuletzt: {formatDate(skill.last_used)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Berufserfahrung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-muted-foreground">{exp.org_name}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                        </div>
                      </div>
                      
                      {exp.summary && (
                        <p className="text-sm mb-3">{exp.summary}</p>
                      )}
                      
                      {exp.tech_stack && exp.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {exp.tech_stack.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          
          {/* Rates & Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Rates & Verfügbarkeit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Monatssatz</h3>
                <p className="text-xl font-bold text-primary">
                  {Math.round(candidate.rate_monthly_target || 0).toLocaleString()} {candidate.currency}
                </p>
                <p className="text-sm text-muted-foreground">
                  ({Math.round(candidate.rate_hourly_target || 0)} {candidate.currency}/Std.)
                </p>
              </div>
              
              {candidate.hours_per_week_pref && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.hours_per_week_pref}h/Woche (Wunsch)</span>
                </div>
              )}
              
              {candidate.start_earliest && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Verfügbar ab: {formatDate(candidate.start_earliest)}</span>
                </div>
              )}
              
              {candidate.notice_period_days && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Kündigungsfrist</h3>
                  <p>{candidate.notice_period_days} Tage</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          {languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Sprachen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {languages.map((lang, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{lang.lang_code.toUpperCase()}</span>
                      <Badge variant="outline">
                        {getProficiencyLabel(lang.proficiency)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links */}
          {links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Links & Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={link.id || index}>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {link.label || link.url}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}