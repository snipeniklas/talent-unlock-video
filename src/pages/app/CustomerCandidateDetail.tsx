import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, DollarSign, Clock, Globe, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Interface definitions
interface Skill {
  name: string;
  proficiency?: string;
}

interface Experience {
  id: string;
  org_name: string;
  title: string;
  start_date: string;
  end_date: string | null;
  summary?: string;
  tech_stack?: any;
}

interface Language {
  lang_code: string;
  proficiency?: string;
}

interface Link {
  id: string;
  label: string;
  url: string;
}

interface Candidate {
  id: string;
  bio?: string;
  headline?: string;
  primary_role?: string;
  seniority?: string;
  years_experience?: number;
  availability?: string;
  hours_per_week_pref?: number;
  start_earliest?: string;
  notice_period_days?: number;
  rate_hourly_target?: number;
  rate_monthly_target?: number;
  margin?: number;
  currency?: string;
  skills: any;
  created_at: string;
  updated_at: string;
}

interface Identity {
  candidate_id: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  country?: string;
  avatar_url?: string;
}

const CustomerCandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCandidateData();
    }
  }, [id]);

  const loadCandidateData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Check if user has access to this candidate through allocations
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.company_id) {
        toast({
          title: "Fehler",
          description: "Keine Firma gefunden.",
          variant: "destructive",
        });
        navigate('/app/dashboard');
        return;
      }

      // Check if this candidate is allocated to any search request of the user's company
      const { data: allocations, error: allocationError } = await supabase
        .from('search_request_allocations')
        .select(`
          candidate_id,
          search_request_id
        `)
        .eq('candidate_id', id);

      if (allocationError) {
        console.error('Error checking allocation:', allocationError);
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keinen Zugriff auf diesen Kandidaten.",
          variant: "destructive",
        });
        navigate('/app/dashboard');
        return;
      }

      if (!allocations || allocations.length === 0) {
        toast({
          title: "Zugriff verweigert", 
          description: "Sie haben keinen Zugriff auf diesen Kandidaten.",
          variant: "destructive",
        });
        navigate('/app/dashboard');
        return;
      }

      // Verify at least one allocation belongs to a search request from user's company
      const searchRequestIds = allocations.map(a => a.search_request_id);
      const { data: searchRequests, error: searchError } = await supabase
        .from('search_requests')
        .select('id')
        .in('id', searchRequestIds)
        .eq('company_id', profile.company_id);

      if (searchError || !searchRequests || searchRequests.length === 0) {
        toast({
          title: "Zugriff verweigert",
          description: "Sie haben keinen Zugriff auf diesen Kandidaten.",
          variant: "destructive",
        });
        navigate('/app/dashboard');
        return;
      }

      // Load candidate data
      const [candidateResponse, identityResponse, experienceResponse, languageResponse, linkResponse] = await Promise.all([
        supabase.from('candidates').select('*').eq('id', id).single(),
        supabase.from('candidate_identity').select('*').eq('candidate_id', id).single(),
        supabase.from('candidate_experience').select('*').eq('candidate_id', id).order('start_date', { ascending: false }),
        supabase.from('candidate_languages').select('*').eq('candidate_id', id),
        supabase.from('candidate_links').select('*').eq('candidate_id', id)
      ]);

      if (candidateResponse.error) {
        throw candidateResponse.error;
      }

      setCandidate(candidateResponse.data);
      setIdentity(identityResponse.data);
      setExperiences(experienceResponse.data || []);
      setLanguages(languageResponse.data || []);
      setLinks(linkResponse.data || []);

    } catch (error) {
      console.error('Error loading candidate data:', error);
      toast({
        title: "Fehler",
        description: "Kandidatendaten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for pricing (customer sees selling price)
  const calculateCustomerMonthlyRate = (candidate: Candidate): number => {
    const baseRate = candidate.rate_monthly_target || 0;
    const margin = candidate.margin || 0;
    return baseRate + margin;
  };

  const calculateCustomerHourlyRate = (candidate: Candidate): number => {
    const monthlyRate = calculateCustomerMonthlyRate(candidate);
    const hours = candidate.hours_per_week_pref || 40;
    const hoursPerMonth = hours * 4.33; // Average weeks per month
    return monthlyRate / hoursPerMonth;
  };

  // Helper functions
  const getSeniorityColor = (seniority: string) => {
    const colors = {
      'junior': 'bg-green-100 text-green-800',
      'mid': 'bg-blue-100 text-blue-800',
      'senior': 'bg-purple-100 text-purple-800',
      'lead': 'bg-orange-100 text-orange-800',
      'principal': 'bg-red-100 text-red-800'
    };
    return colors[seniority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityColor = (availability: string) => {
    const colors = {
      'immediately': 'bg-green-100 text-green-800',
      '1_month': 'bg-yellow-100 text-yellow-800',
      '3_months': 'bg-orange-100 text-orange-800',
      '6_months': 'bg-red-100 text-red-800'
    };
    return colors[availability as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const getProficiencyLabel = (proficiency: string) => {
    const labels = {
      'beginner': 'Anfänger',
      'intermediate': 'Fortgeschritten',
      'advanced': 'Erfahren',
      'expert': 'Experte',
      'native': 'Muttersprache'
    };
    return labels[proficiency as keyof typeof labels] || proficiency;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kandidat nicht gefunden</h2>
          <p className="text-gray-600 mb-4">Der angeforderte Kandidat konnte nicht gefunden werden.</p>
          <Button onClick={() => navigate('/app/dashboard')}>
            Zurück zum Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Kandidatendetails</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={identity?.avatar_url || ''} alt={identity?.first_name || ''} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(identity?.first_name, identity?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      {identity?.first_name} {identity?.last_name}
                    </CardTitle>
                    <p className="text-lg text-gray-600 mt-1">{candidate.primary_role}</p>
                    {candidate.headline && (
                      <p className="text-gray-500 mt-2">{candidate.headline}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3">
                      {identity?.city && (
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{identity.city}, {identity.country}</span>
                        </div>
                      )}
                      {candidate.seniority && (
                        <Badge className={getSeniorityColor(candidate.seniority)}>
                          {candidate.seniority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {candidate.bio && (
                <CardContent>
                  <h3 className="font-semibold mb-2">Über mich</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{candidate.bio}</p>
                </CardContent>
              )}
            </Card>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fähigkeiten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {typeof skill === 'string' ? skill : skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Experience */}
            {experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Berufserfahrung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {experiences.map((exp, index) => (
                      <div key={exp.id}>
                        {index > 0 && <Separator className="my-4" />}
                        <div>
                          <h3 className="font-semibold text-lg">{exp.title}</h3>
                          <p className="text-primary font-medium">{exp.org_name}</p>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {formatDate(exp.start_date)} - {exp.end_date ? formatDate(exp.end_date) : 'Aktuell'}
                            </span>
                          </div>
                          {exp.summary && (
                            <p className="text-gray-700 mt-2 whitespace-pre-wrap">{exp.summary}</p>
                          )}
                          {exp.tech_stack && exp.tech_stack.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-600 mb-2">Technologien:</p>
                              <div className="flex flex-wrap gap-1">
                                {exp.tech_stack.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="outline" className="text-xs">
                                    {typeof tech === 'string' ? tech : tech.name || tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rates & Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Konditionen & Verfügbarkeit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.rate_monthly_target && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stundensatz</p>
                    <p className="text-lg font-semibold text-green-600">
                      {calculateCustomerHourlyRate(candidate).toFixed(2)} {candidate.currency || 'EUR'}/h
                    </p>
                  </div>
                )}

                {candidate.rate_monthly_target && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monatssatz</p>
                    <p className="text-lg font-semibold text-green-600">
                      {calculateCustomerMonthlyRate(candidate).toFixed(2)} {candidate.currency || 'EUR'}/Monat
                    </p>
                  </div>
                )}

                {candidate.availability && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verfügbarkeit</p>
                    <Badge className={getAvailabilityColor(candidate.availability)}>
                      {candidate.availability === 'immediately' && 'Sofort verfügbar'}
                      {candidate.availability === '1_month' && 'In 1 Monat'}
                      {candidate.availability === '3_months' && 'In 3 Monaten'}
                      {candidate.availability === '6_months' && 'In 6 Monaten'}
                    </Badge>
                  </div>
                )}

                {candidate.hours_per_week_pref && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Wochenstunden</p>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{candidate.hours_per_week_pref}h/Woche</span>
                    </div>
                  </div>
                )}

                {candidate.start_earliest && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Frühester Start</p>
                    <p>{formatDate(candidate.start_earliest)}</p>
                  </div>
                )}

                {candidate.notice_period_days && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Kündigungsfrist</p>
                    <p>{candidate.notice_period_days} Tage</p>
                  </div>
                )}

                {candidate.years_experience && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Berufserfahrung</p>
                    <p>{candidate.years_experience} Jahre</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            {languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Sprachen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {languages.map((lang, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{lang.lang_code.toUpperCase()}</span>
                        {lang.proficiency && (
                          <Badge variant="outline">
                            {getProficiencyLabel(lang.proficiency)}
                          </Badge>
                        )}
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
                  <CardTitle className="flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCandidateDetail;