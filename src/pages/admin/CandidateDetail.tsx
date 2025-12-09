import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Save, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import AvatarUpload from '@/components/AvatarUpload';
import { useTranslation } from '@/i18n/i18n';

interface Skill {
  name: string;
  level: number;
  years_used: number;
  last_used: string;
}

interface Experience {
  id?: string;
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
  id?: string;
  label: string;
  url: string;
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    margin: '',
  });

  // User role for conditional rendering
  const [userRole, setUserRole] = useState<string>('');

  // Identity data
  const [identity, setIdentity] = useState({
    first_name: '',
    last_name: '',
    country: '',
    city: '',
    avatar_url: '',
  });

  // Skills
  const [skills, setSkills] = useState<Skill[]>([]);

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Languages
  const [languages, setLanguages] = useState<Language[]>([]);

  // Links
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    loadCandidateData();
    loadUserRole();
  }, [id]);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      setUserRole(roles?.role || '');
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadCandidateData = async () => {
    if (!id) return;
    
    setLoadingData(true);
    try {
      // Load candidate
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single();

      if (candidateError) throw candidateError;

      setFormData({
        primary_role: candidate.primary_role || '',
        seniority: (candidate.seniority as 'junior' | 'mid' | 'senior' | 'lead') || 'junior',
        years_experience: candidate.years_experience?.toString() || '',
        headline: candidate.headline || '',
        bio: candidate.bio || '',
        availability: (candidate.availability as 'immediately' | 'notice_period' | 'booked' | 'paused') || 'immediately',
        hours_per_week_pref: candidate.hours_per_week_pref?.toString() || '',
        start_earliest: candidate.start_earliest || '',
        notice_period_days: candidate.notice_period_days?.toString() || '',
        currency: candidate.currency || 'EUR',
        rate_hourly_target: candidate.rate_hourly_target?.toString() || '',
        rate_monthly_target: candidate.rate_monthly_target?.toString() || '',
        margin: (candidate as any).margin?.toString() || '0',
      });

      try {
        setSkills(Array.isArray(candidate.skills) ? candidate.skills as unknown as Skill[] : []);
      } catch (e) {
        setSkills([]);
      }

      // Load identity
      const { data: identityData } = await supabase
        .from('candidate_identity')
        .select('*')
        .eq('candidate_id', id)
        .single();

      if (identityData) {
        setIdentity({
          first_name: identityData.first_name || '',
          last_name: identityData.last_name || '',
          country: identityData.country || '',
          city: identityData.city || '',
          avatar_url: identityData.avatar_url || '',
        });
      }

      // Load experiences
      const { data: experienceData } = await supabase
        .from('candidate_experience')
        .select('*')
        .eq('candidate_id', id)
        .order('start_date', { ascending: false });

      if (experienceData) {
        setExperiences(experienceData.map(exp => ({
          id: exp.id,
          title: exp.title || '',
          org_name: exp.org_name || '',
          start_date: exp.start_date || '',
          end_date: exp.end_date || '',
          summary: exp.summary || '',
          tech_stack: Array.isArray(exp.tech_stack) ? exp.tech_stack as string[] : [],
        })));
      }

      // Load languages
      const { data: languageData } = await supabase
        .from('candidate_languages')
        .select('*')
        .eq('candidate_id', id);

      if (languageData) {
        setLanguages(languageData.map(lang => ({
          lang_code: lang.lang_code,
          proficiency: lang.proficiency,
        })));
      }

      // Load links
      const { data: linkData } = await supabase
        .from('candidate_links')
        .select('*')
        .eq('candidate_id', id);

      if (linkData) {
        setLinks(linkData.map(link => ({
          id: link.id,
          label: link.label || '',
          url: link.url || '',
        })));
      }

    } catch (error) {
      console.error('Error loading candidate:', error);
      toast({
        title: t('candidateManagement.edit.toast.updateError'),
        description: t('candidateManagement.edit.toast.loadError'),
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

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

  // Helper functions for pricing calculations
  const calculateSellingPrice = (): number => {
    const monthly = parseFloat(formData.rate_monthly_target) || 0;
    const margin = parseFloat(formData.margin) || 0;
    return monthly + margin;
  };

  const calculateHourlySellingPrice = (): number => {
    const sellingPrice = calculateSellingPrice();
    const hours = parseFloat(formData.hours_per_week_pref) || 40;
    const hoursPerMonth = hours * 4.33; // Average weeks per month
    return sellingPrice / hoursPerMonth;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setLoading(true);

    try {
      // Prepare update data
      const updateData: any = {
        primary_role: formData.primary_role,
        seniority: formData.seniority,
        years_experience: formData.years_experience ? parseFloat(formData.years_experience) : null,
        headline: formData.headline,
        bio: formData.bio,
        availability: formData.availability,
        hours_per_week_pref: formData.hours_per_week_pref ? parseInt(formData.hours_per_week_pref) : null,
        start_earliest: formData.start_earliest || null,
        notice_period_days: formData.notice_period_days ? parseInt(formData.notice_period_days) : null,
        currency: formData.currency,
        rate_hourly_target: formData.rate_hourly_target ? parseFloat(formData.rate_hourly_target) : null,
        rate_monthly_target: formData.rate_monthly_target ? parseFloat(formData.rate_monthly_target) : null,
        skills: skills.filter(s => s.name),
      };

      // Only admins can update margin
      if (userRole === 'admin') {
        updateData.margin = parseFloat(formData.margin) || 0;
      }

      // Update candidate
      const { error: candidateError } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('id', id);

      if (candidateError) throw candidateError;

      // Update or create identity
      const { error: identityError } = await supabase
        .from('candidate_identity')
        .upsert({
          candidate_id: id,
          ...identity,
        });

      if (identityError) throw identityError;

      // Delete existing languages and recreate
      await supabase
        .from('candidate_languages')
        .delete()
        .eq('candidate_id', id);

      if (languages.length > 0) {
        const languageData = languages
          .filter(lang => lang.lang_code && lang.proficiency)
          .map(lang => ({
            candidate_id: id,
            ...lang,
          }));

        if (languageData.length > 0) {
          const { error: languageError } = await supabase
            .from('candidate_languages')
            .insert(languageData);

          if (languageError) throw languageError;
        }
      }

      // Handle experiences (update existing, insert new, delete removed)
      const existingExpIds = experiences.filter(exp => exp.id).map(exp => exp.id);
      
      // Delete experiences that are no longer in the list
      if (existingExpIds.length > 0) {
        await supabase
          .from('candidate_experience')
          .delete()
          .eq('candidate_id', id)
          .not('id', 'in', `(${existingExpIds.join(',')})`);
      } else {
        await supabase
          .from('candidate_experience')
          .delete()
          .eq('candidate_id', id);
      }

      // Update/insert experiences
      for (const exp of experiences.filter(exp => exp.title)) {
        const expData = {
          candidate_id: id,
          title: exp.title,
          org_name: exp.org_name,
          start_date: exp.start_date || null,
          end_date: exp.end_date || null,
          summary: exp.summary,
          tech_stack: exp.tech_stack.length > 0 ? exp.tech_stack : null,
        };

        if (exp.id) {
          const { error } = await supabase
            .from('candidate_experience')
            .update(expData)
            .eq('id', exp.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('candidate_experience')
            .insert(expData);
          if (error) throw error;
        }
      }

      // Handle links similarly
      const existingLinkIds = links.filter(link => link.id).map(link => link.id);
      
      if (existingLinkIds.length > 0) {
        await supabase
          .from('candidate_links')
          .delete()
          .eq('candidate_id', id)
          .not('id', 'in', `(${existingLinkIds.join(',')})`);
      } else {
        await supabase
          .from('candidate_links')
          .delete()
          .eq('candidate_id', id);
      }

      for (const link of links.filter(link => link.url)) {
        const linkData = {
          candidate_id: id,
          label: link.label,
          url: link.url,
        };

        if (link.id) {
          const { error } = await supabase
            .from('candidate_links')
            .update(linkData)
            .eq('id', link.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('candidate_links')
            .insert(linkData);
          if (error) throw error;
        }
      }

      toast({
        title: t('candidateManagement.edit.toast.updateSuccess'),
        description: t('candidateManagement.edit.toast.updateSuccessDesc'),
      });

      // Reload data to get fresh state
      await loadCandidateData();

    } catch (error) {
      console.error('Error updating candidate:', error);
      toast({
        title: t('candidateManagement.edit.toast.updateError'),
        description: t('candidateManagement.edit.toast.updateErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t('candidateManagement.edit.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/candidates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('candidateManagement.edit.back')}
        </Button>
        <h1 className="text-2xl font-bold">{t('candidateManagement.edit.title')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('candidateManagement.edit.sections.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">{t('candidateManagement.edit.labels.firstName')}</Label>
                <Input
                  id="first_name"
                  value={identity.first_name}
                  onChange={(e) => setIdentity({ ...identity, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="last_name">{t('candidateManagement.edit.labels.lastName')}</Label>
                <Input
                  id="last_name"
                  value={identity.last_name}
                  onChange={(e) => setIdentity({ ...identity, last_name: e.target.value })}
                />
              </div>
            </div>
            
            <div className="col-span-2">
              <AvatarUpload
                currentAvatarUrl={identity.avatar_url}
                candidateId={id}
                firstName={identity.first_name}
                lastName={identity.last_name}
                onAvatarChange={(url) => setIdentity({ ...identity, avatar_url: url || '' })}
              />
            </div>

            <div>
              <Label htmlFor="primary_role">{t('candidateManagement.edit.labels.role')}</Label>
              <Input
                id="primary_role"
                value={formData.primary_role}
                onChange={(e) => setFormData({ ...formData, primary_role: e.target.value })}
                required
                placeholder={t('candidateManagement.edit.placeholders.role')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seniority">{t('candidateManagement.edit.labels.seniority')}</Label>
                <Select 
                  value={formData.seniority} 
                  onValueChange={(value) => setFormData({ ...formData, seniority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('candidateManagement.edit.selectPlaceholders.seniority')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">{t('candidateManagement.seniority.junior')}</SelectItem>
                    <SelectItem value="mid">{t('candidateManagement.seniority.mid')}</SelectItem>
                    <SelectItem value="senior">{t('candidateManagement.seniority.senior')}</SelectItem>
                    <SelectItem value="lead">{t('candidateManagement.seniority.lead')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="years_experience">{t('candidateManagement.edit.labels.yearsExperience')}</Label>
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
              <Label htmlFor="headline">{t('candidateManagement.edit.labels.headline')}</Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder={t('candidateManagement.edit.placeholders.headline')}
              />
            </div>

            <div>
              <Label htmlFor="bio">{t('candidateManagement.edit.labels.bio')}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t('candidateManagement.edit.placeholders.bio')}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>{t('candidateManagement.edit.sections.location')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">{t('candidateManagement.edit.labels.country')}</Label>
                <Input
                  id="country"
                  value={identity.country}
                  onChange={(e) => setIdentity({ ...identity, country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">{t('candidateManagement.edit.labels.city')}</Label>
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
            <CardTitle>{t('candidateManagement.edit.sections.availability')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availability">{t('candidateManagement.edit.labels.availability')}</Label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(value) => setFormData({ ...formData, availability: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('candidateManagement.edit.selectPlaceholders.availability')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">{t('candidateManagement.availability.immediately')}</SelectItem>
                    <SelectItem value="notice_period">{t('candidateManagement.availability.notice_period')}</SelectItem>
                    <SelectItem value="booked">{t('candidateManagement.availability.booked')}</SelectItem>
                    <SelectItem value="paused">{t('candidateManagement.availability.paused')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hours_per_week_pref">{t('candidateManagement.edit.labels.hoursPerWeek')}</Label>
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
                <Label htmlFor="start_earliest">{t('candidateManagement.edit.labels.earliestStart')}</Label>
                <Input
                  id="start_earliest"
                  type="date"
                  value={formData.start_earliest}
                  onChange={(e) => setFormData({ ...formData, start_earliest: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notice_period_days">{t('candidateManagement.edit.labels.noticePeriod')}</Label>
                <Input
                  id="notice_period_days"
                  type="number"
                  value={formData.notice_period_days}
                  onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currency">{t('candidateManagement.edit.labels.currency')}</Label>
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
                <Label htmlFor="rate_monthly_target">{t('candidateManagement.edit.labels.monthlyRate')}</Label>
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
                  placeholder={t('candidateManagement.edit.placeholders.monthlyRate')}
                />
              </div>
              <div>
                <Label htmlFor="rate_hourly_target">{t('candidateManagement.edit.labels.hourlyRate')}</Label>
                <Input
                  id="rate_hourly_target"
                  type="number"
                  step="0.01"
                  value={formData.rate_hourly_target}
                  disabled
                  placeholder={t('candidateManagement.edit.placeholders.hourlyRate')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Margin & Pricing - Only for Hej Talent Admins */}
        {userRole === 'admin' && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('candidateManagement.edit.sections.margin')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Monthly Rates Overview */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-background rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('candidateManagement.edit.pricing.purchaseMonthly')}</Label>
                  <p className="text-lg font-semibold text-foreground">
                    {formData.rate_monthly_target ? parseFloat(formData.rate_monthly_target).toFixed(2) : '0.00'} {formData.currency}
                  </p>
                </div>
                <div>
                  <Label htmlFor="margin">{t('candidateManagement.edit.pricing.marginLabel')}</Label>
                  <Input
                    id="margin"
                    type="number"
                    step="0.01"
                    value={formData.margin}
                    onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
                    placeholder={t('candidateManagement.edit.placeholders.margin')}
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('candidateManagement.edit.pricing.sellingMonthly')}</Label>
                  <p className="text-lg font-bold text-primary">
                    {calculateSellingPrice().toFixed(2)} {formData.currency}
                  </p>
                </div>
              </div>
              
              {/* Hourly Rates Overview */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('candidateManagement.edit.pricing.purchaseHourly')}</Label>
                  <p className="text-lg font-semibold text-foreground">
                    {formData.rate_hourly_target ? parseFloat(formData.rate_hourly_target).toFixed(2) : '0.00'} {formData.currency}/h
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('candidateManagement.edit.pricing.sellingHourly')}</Label>
                  <p className="text-lg font-bold text-primary">
                    {calculateHourlySellingPrice().toFixed(2)} {formData.currency}/h
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {t('candidateManagement.edit.pricing.hint')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('candidateManagement.edit.sections.skills')}
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
                    <Label>{t('candidateManagement.edit.labels.skillName')}</Label>
                    <Input
                      value={skill.name}
                      onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      placeholder={t('candidateManagement.edit.placeholders.skill')}
                    />
                  </div>
                  <div>
                    <Label>{t('candidateManagement.edit.labels.skillLevel')}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={skill.level}
                      onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>{t('candidateManagement.edit.labels.yearsUsed')}</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={skill.years_used}
                      onChange={(e) => updateSkill(index, 'years_used', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>{t('candidateManagement.edit.labels.lastUsed')}</Label>
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
              {t('candidateManagement.edit.sections.languages')}
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
                    <Label>{t('candidateManagement.edit.labels.langCode')}</Label>
                    <Input
                      value={language.lang_code}
                      onChange={(e) => updateLanguage(index, 'lang_code', e.target.value)}
                      placeholder={t('candidateManagement.edit.placeholders.langCode')}
                    />
                  </div>
                  <div>
                    <Label>{t('candidateManagement.edit.labels.langLevel')}</Label>
                    <Select 
                      value={language.proficiency} 
                      onValueChange={(value) => updateLanguage(index, 'proficiency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">{t('candidateManagement.proficiency.basic')}</SelectItem>
                        <SelectItem value="conversational">{t('candidateManagement.proficiency.conversational')}</SelectItem>
                        <SelectItem value="fluent">{t('candidateManagement.proficiency.fluent')}</SelectItem>
                        <SelectItem value="native">{t('candidateManagement.proficiency.native')}</SelectItem>
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
              {t('candidateManagement.edit.sections.experience')}
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
                    <h4 className="font-medium">{t('candidateManagement.edit.experienceSection.itemTitle')} #{index + 1}</h4>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeExperience(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('candidateManagement.edit.labels.position')}</Label>
                      <Input
                        value={experience.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        placeholder={t('candidateManagement.edit.placeholders.position')}
                      />
                    </div>
                    <div>
                      <Label>{t('candidateManagement.edit.labels.company')}</Label>
                      <Input
                        value={experience.org_name}
                        onChange={(e) => updateExperience(index, 'org_name', e.target.value)}
                        placeholder={t('candidateManagement.edit.placeholders.company')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('candidateManagement.edit.labels.startDate')}</Label>
                      <Input
                        type="date"
                        value={experience.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{t('candidateManagement.edit.labels.endDate')}</Label>
                      <Input
                        type="date"
                        value={experience.end_date}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t('candidateManagement.edit.labels.description')}</Label>
                    <Textarea
                      value={experience.summary}
                      onChange={(e) => updateExperience(index, 'summary', e.target.value)}
                      placeholder={t('candidateManagement.edit.placeholders.description')}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>{t('candidateManagement.edit.labels.techStack')}</Label>
                    <Input
                      value={experience.tech_stack.join(', ')}
                      onChange={(e) => updateExperience(index, 'tech_stack', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      placeholder={t('candidateManagement.edit.placeholders.techStack')}
                    />
                  </div>
                </div>
              ))}
              
              {experiences.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  {t('candidateManagement.edit.experienceSection.empty')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('candidateManagement.edit.sections.links')}
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
                    <Label>{t('candidateManagement.edit.labels.linkLabel')}</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(index, 'label', e.target.value)}
                      placeholder={t('candidateManagement.edit.placeholders.linkLabel')}
                    />
                  </div>
                  <div>
                    <Label>{t('candidateManagement.edit.labels.linkUrl')}</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      placeholder={t('candidateManagement.edit.placeholders.linkUrl')}
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
            {t('candidateManagement.edit.buttons.cancel')}
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? t('candidateManagement.edit.buttons.saving') : t('candidateManagement.edit.buttons.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
