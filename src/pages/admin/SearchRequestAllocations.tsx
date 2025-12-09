import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, User, Mail, MapPin, Calendar, Star, TrendingUp, MessageSquare, Trash2, Euro, Clock, Building2, Users, Briefcase, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/i18n";

interface SearchRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  company_id: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  number_of_workers?: number;
  start_date?: string;
  end_date?: string;
  weekly_hours?: number;
  customer_industry?: string;
  job_title?: string;
  skills_required?: string[];
  requirements?: string;
  main_tasks?: string[];
  work_areas?: string[];
  companies: {
    name: string;
  };
}

interface Candidate {
  id: string;
  headline: string;
  bio: string;
  primary_role: string;
  seniority: string;
  years_experience: number;
  rate_hourly_target: number;
  currency: string;
  skills: Array<{
    name: string;
    level?: string;
    last_used?: string;
    years_used?: number;
  }> | string[];
  candidate_identity: {
    first_name: string;
    last_name: string;
    country: string;
    city: string;
    avatar_url: string;
    candidate_id: string;
  } | null;
}

interface Allocation {
  id: string;
  candidate_id: string;
  status: string;
  client_status: string;
  notes: string;
  client_feedback: string;
  allocated_at: string;
  updated_at: string;
  candidates: Candidate;
}

const SearchRequestAllocations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, lang } = useTranslation();
  
  const [searchRequest, setSearchRequest] = useState<SearchRequest | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [availableCandidates, setAvailableCandidates] = useState<Candidate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const getLocale = () => {
    switch (lang) {
      case 'de': return 'de-DE';
      case 'nl': return 'nl-NL';
      default: return 'en-US';
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      console.log('Fetching data for search request ID:', id);
      
      // Search Request Details - use maybeSingle instead of single for better error handling
      const { data: searchRequestData, error: srError } = await supabase
        .from('search_requests')
        .select(`
          *,
          companies (
            name
          )
        `)
        .eq('id', id)
        .maybeSingle();

      console.log('Search request data:', searchRequestData);
      console.log('Search request error:', srError);
      
      if (srError) throw srError;
      setSearchRequest(searchRequestData);

      // Allocations (without candidates relation)
      const { data: allocationsData, error: allocError } = await supabase
        .from('search_request_allocations')
        .select('*')
        .eq('search_request_id', id);

      if (allocError) throw allocError;

      // Get candidate details for each allocation
      const allocationsWithCandidates = [];
      if (allocationsData && allocationsData.length > 0) {
        for (const allocation of allocationsData) {
          const { data: candidateData } = await supabase
            .from('candidates')
            .select(`
              *,
              candidate_identity (*)
            `)
            .eq('id', allocation.candidate_id)
            .single();
          
          allocationsWithCandidates.push({
            ...allocation,
            candidates: candidateData
          });
        }
      }
      
      setAllocations(allocationsWithCandidates);

      // Available candidates (not yet allocated)
      const allocatedCandidateIds = allocationsData?.map(a => a.candidate_id) || [];
      
      let candidatesQuery = supabase
        .from('candidates')
        .select(`
          *,
          candidate_identity!inner (*)
        `);

      // Only add the not-in filter if there are allocated candidates
      if (allocatedCandidateIds.length > 0) {
        candidatesQuery = candidatesQuery.not('id', 'in', `(${allocatedCandidateIds.join(',')})`);
      }

      const { data: candidatesData, error: candError } = await candidatesQuery;

      if (candError) throw candError;
      setAvailableCandidates((candidatesData as any) || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: t('app.adminSearchRequests.allocationsPage.toast.loadError'),
        description: t('app.adminSearchRequests.allocationsPage.toast.loadErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateCandidate = async () => {
    if (!selectedCandidate || !id) return;

    try {
      const { error } = await supabase
        .from('search_request_allocations')
        .insert({
          search_request_id: id,
          candidate_id: selectedCandidate,
          allocated_by: (await supabase.auth.getUser()).data.user?.id,
          notes: notes,
          status: 'proposed'
        });

      if (error) throw error;

      toast({
        title: t('app.adminSearchRequests.allocationsPage.toast.assignSuccess'),
        description: t('app.adminSearchRequests.allocationsPage.toast.assignSuccessDesc'),
      });

      setIsDialogOpen(false);
      setSelectedCandidate('');
      setNotes('');
      fetchData();
    } catch (error) {
      console.error('Error allocating candidate:', error);
      toast({
        title: t('app.adminSearchRequests.allocationsPage.toast.assignError'),
        description: t('app.adminSearchRequests.allocationsPage.toast.assignErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (allocationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('search_request_allocations')
        .update({ status: newStatus })
        .eq('id', allocationId);

      if (error) throw error;

      toast({
        title: t('app.adminSearchRequests.allocationsPage.toast.statusSuccess'),
        description: t('app.adminSearchRequests.allocationsPage.toast.statusSuccessDesc'),
      });

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: t('app.adminSearchRequests.allocationsPage.toast.statusError'),
        description: t('app.adminSearchRequests.allocationsPage.toast.statusErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const handleRemoveAllocation = async (allocationId: string) => {
    try {
      const { error } = await supabase
        .from('search_request_allocations')
        .delete()
        .eq('id', allocationId);

      if (error) throw error;

      toast({
        title: t('app.adminSearchRequests.allocationsPage.toast.removeSuccess'),
        description: t('app.adminSearchRequests.allocationsPage.toast.removeSuccessDesc'),
      });

      fetchData();
    } catch (error) {
      console.error('Error removing allocation:', error);
      toast({
        title: t('app.adminSearchRequests.allocationsPage.toast.removeError'),
        description: t('app.adminSearchRequests.allocationsPage.toast.removeErrorDesc'),
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'proposed': return 'secondary';
      case 'presented': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const key = `app.adminSearchRequests.allocationsPage.status.${status}`;
    const translated = t(key);
    return translated !== key ? translated : status;
  };

  const getClientStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'proposed': return 'secondary';
      case 'reviewed': return 'outline';
      case 'interested': return 'default';
      case 'not_interested': return 'destructive';
      case 'interview_scheduled': return 'default';
      case 'hired': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getClientStatusLabel = (status: string) => {
    const key = `app.adminSearchRequests.allocationsPage.status.${status}`;
    const translated = t(key);
    return translated !== key ? translated : status;
  };

  if (loading) {
    return <div className="p-6">{t('app.adminSearchRequests.allocationsPage.loading')}</div>;
  }

  if (!searchRequest) {
    return <div className="p-6">{t('app.adminSearchRequests.allocationsPage.notFound')}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/search-requests')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('app.adminSearchRequests.allocationsPage.back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{searchRequest.title}</h1>
          <p className="text-muted-foreground">{searchRequest.companies?.name || t('app.adminSearchRequests.allocationsPage.unknownCompany')}</p>
        </div>
      </div>

      {/* Search Request Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {t('app.adminSearchRequests.allocationsPage.details.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Grundlegende Informationen */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {t('app.adminSearchRequests.allocationsPage.details.sections.basicInfo')}
              </h4>
              
              <div>
                <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.description')}</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchRequest.description || t('app.adminSearchRequests.allocationsPage.details.labels.noDescription')}
                </p>
              </div>
              
              {searchRequest.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.location')}</Label>
                    <p className="text-sm text-muted-foreground">{searchRequest.location}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.status')}</Label>
                  <div className="mt-1">
                    <Badge variant={searchRequest.status === 'active' ? 'default' : 'secondary'}>
                      {searchRequest.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Anstellungsdetails */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {t('app.adminSearchRequests.allocationsPage.details.sections.employment')}
              </h4>
              
              {searchRequest.employment_type && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.employmentType')}</Label>
                    <p className="text-sm text-muted-foreground">{searchRequest.employment_type}</p>
                  </div>
                </div>
              )}
              
              {searchRequest.experience_level && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.experienceLevel')}</Label>
                    <p className="text-sm text-muted-foreground">{searchRequest.experience_level}</p>
                  </div>
                </div>
              )}
              
              {(searchRequest.salary_min || searchRequest.salary_max) && (
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.salaryRange')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {searchRequest.salary_min && searchRequest.salary_max 
                        ? `€${searchRequest.salary_min?.toLocaleString(getLocale())} - €${searchRequest.salary_max?.toLocaleString(getLocale())}`
                        : searchRequest.salary_min 
                          ? t('app.adminSearchRequests.allocationsPage.details.labels.salaryFrom').replace('{amount}', searchRequest.salary_min?.toLocaleString(getLocale()))
                          : t('app.adminSearchRequests.allocationsPage.details.labels.salaryTo').replace('{amount}', searchRequest.salary_max?.toLocaleString(getLocale()) || '')
                      }
                    </p>
                  </div>
                </div>
              )}
              
              {searchRequest.number_of_workers && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.numberOfWorkers')}</Label>
                    <p className="text-sm text-muted-foreground">{searchRequest.number_of_workers}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Zeitplan & Umfang */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {t('app.adminSearchRequests.allocationsPage.details.sections.schedule')}
              </h4>
              
              {searchRequest.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.startDate')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(searchRequest.start_date).toLocaleDateString(getLocale())}
                    </p>
                  </div>
                </div>
              )}
              
              {searchRequest.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.endDate')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(searchRequest.end_date).toLocaleDateString(getLocale())}
                    </p>
                  </div>
                </div>
              )}
              
              {searchRequest.weekly_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.weeklyHours').split('{hours}')[0]}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('app.adminSearchRequests.allocationsPage.details.labels.weeklyHours').replace('{hours}', String(searchRequest.weekly_hours))}
                    </p>
                  </div>
                </div>
              )}
              
              {searchRequest.customer_industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.details.labels.industry')}</Label>
                    <p className="text-sm text-muted-foreground">{searchRequest.customer_industry}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zusätzliche Details */}
          <Separator className="my-6" />
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills & Anforderungen */}
            <div className="space-y-4">
              {searchRequest.skills_required && searchRequest.skills_required.length > 0 && (
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4" />
                    {t('app.adminSearchRequests.allocationsPage.details.labels.requiredSkills')}
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {searchRequest.skills_required.map((skill: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {searchRequest.requirements && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('app.adminSearchRequests.allocationsPage.details.labels.requirements')}</Label>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {searchRequest.requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Aufgaben & Arbeitsbereiche */}
            <div className="space-y-4">
              {searchRequest.main_tasks && searchRequest.main_tasks.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('app.adminSearchRequests.allocationsPage.details.labels.mainTasks')}</Label>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {searchRequest.main_tasks.map((task: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {searchRequest.work_areas && searchRequest.work_areas.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('app.adminSearchRequests.allocationsPage.details.labels.workAreas')}</Label>
                  <div className="flex flex-wrap gap-1">
                    {searchRequest.work_areas.map((area: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocated Candidates */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {t('app.adminSearchRequests.allocationsPage.candidates.title').replace('{count}', String(allocations.length))}
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('app.adminSearchRequests.allocationsPage.candidates.assign')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('app.adminSearchRequests.allocationsPage.dialog.title')}</DialogTitle>
              <DialogDescription>
                {t('app.adminSearchRequests.allocationsPage.dialog.description')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>{t('app.adminSearchRequests.allocationsPage.dialog.selectLabel')}</Label>
                <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('app.adminSearchRequests.allocationsPage.dialog.selectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCandidates.map((candidate) => {
                      const identity = candidate.candidate_identity;
                      return (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={identity?.avatar_url} />
                              <AvatarFallback>
                                {identity?.first_name?.[0]}{identity?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {identity?.first_name} {identity?.last_name} - {candidate.primary_role}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>{t('app.adminSearchRequests.allocationsPage.dialog.notesLabel')}</Label>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('app.adminSearchRequests.allocationsPage.dialog.notesPlaceholder')}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('app.adminSearchRequests.allocationsPage.dialog.cancel')}
                </Button>
                <Button 
                  onClick={handleAllocateCandidate}
                  disabled={!selectedCandidate}
                >
                  {t('app.adminSearchRequests.allocationsPage.dialog.assign')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Allocations List */}
      <div className="space-y-4">
        {allocations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('app.adminSearchRequests.allocationsPage.empty.title')}</p>
              <p className="text-sm">{t('app.adminSearchRequests.allocationsPage.empty.description')}</p>
            </CardContent>
          </Card>
        ) : (
          allocations.map((allocation) => {
            const candidate = allocation.candidates;
            const identity = candidate?.candidate_identity;
            
            return (
              <Card key={allocation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={identity?.avatar_url} />
                        <AvatarFallback>
                          {identity?.first_name?.[0]}{identity?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {identity?.first_name} {identity?.last_name}
                          </h3>
                          <p className="text-muted-foreground">{candidate?.headline}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span>{candidate?.seniority}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{t('app.adminSearchRequests.allocationsPage.candidates.yearsExperience').replace('{years}', String(candidate?.years_experience))}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{identity?.city}, {identity?.country}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>€{candidate?.rate_hourly_target}/h</span>
                          </div>
                        </div>
                        
                        {candidate?.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 5).map((skill: any, index: number) => {
                              const skillName = typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill';
                              return (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skillName}
                                </Badge>
                              );
                            })}
                            {candidate.skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                {t('app.adminSearchRequests.allocationsPage.candidates.moreSkills').replace('{count}', String(candidate.skills.length - 5))}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {allocation.notes && (
                          <div className="bg-muted p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm font-medium">{t('app.adminSearchRequests.allocationsPage.candidates.notes')}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{allocation.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">{t('app.adminSearchRequests.allocationsPage.statusLabels.adminStatus')}</div>
                        <Badge variant={getStatusBadgeVariant(allocation.status)}>
                          {getStatusLabel(allocation.status)}
                        </Badge>
                        
                        <div className="text-xs font-medium text-muted-foreground">{t('app.adminSearchRequests.allocationsPage.statusLabels.clientStatus')}</div>
                        <Badge variant={getClientStatusBadgeVariant(allocation.client_status || 'proposed')}>
                          {getClientStatusLabel(allocation.client_status || 'proposed')}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Select 
                          value={allocation.status} 
                          onValueChange={(value) => handleStatusChange(allocation.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="proposed">{t('app.adminSearchRequests.allocationsPage.status.proposed')}</SelectItem>
                            <SelectItem value="presented">{t('app.adminSearchRequests.allocationsPage.status.presented')}</SelectItem>
                            <SelectItem value="accepted">{t('app.adminSearchRequests.allocationsPage.status.accepted')}</SelectItem>
                            <SelectItem value="rejected">{t('app.adminSearchRequests.allocationsPage.status.rejected')}</SelectItem>
                            <SelectItem value="hired">{t('app.adminSearchRequests.allocationsPage.status.hired')}</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveAllocation(allocation.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {t('app.adminSearchRequests.allocationsPage.candidates.assignedAt').replace('{date}', new Date(allocation.allocated_at).toLocaleDateString(getLocale()))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SearchRequestAllocations;
