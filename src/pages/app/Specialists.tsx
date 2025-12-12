import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Briefcase, 
  Mail,
  Phone,
  Eye,
  Lock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n/i18n';
import { useUserData } from '@/hooks/useUserData';
import { cn } from '@/lib/utils';

interface Specialist {
  id: string;
  first_name: string;
  last_name: string;
  current_position: string;
  location: string;
  experience_years: number;
  rating: number;
  skills: string[];
  status: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
  notes: string;
  email: string;
  phone: string;
  category?: string;
  customerMonthlyRate: number;
}

const Specialists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { data: userData } = useUserData();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [allocatedCandidateIds, setAllocatedCandidateIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('recommended');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all candidates
        const { data: resources, error } = await supabase
          .from('candidates')
          .select(`
            *,
            candidate_identity (first_name, last_name, country, city)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching specialists:', error);
          toast({
            title: t('app.specialists.toasts.error'),
            description: t('app.specialists.toasts.loadError'),
            variant: "destructive",
          });
          return;
        }

        // Fetch allocated candidate IDs for the user's company
        if (userData?.profile?.company_id) {
          const { data: allocations } = await supabase
            .from('search_request_allocations')
            .select(`
              candidate_id,
              search_requests!inner(company_id)
            `)
            .eq('search_requests.company_id', userData.profile.company_id);

          if (allocations) {
            const allocatedIds = new Set(allocations.map(a => a.candidate_id));
            setAllocatedCandidateIds(allocatedIds);
          }
        }

        // Transform candidate data to match specialist interface
        const transformedData = (resources || []).map((candidate: any) => {
          // Calculate customer hourly rate (selling price)
          const baseMonthlyRate = candidate.rate_monthly_target || 0;
          const margin = candidate.margin || 0;
          const monthlyRate = baseMonthlyRate + margin;
          const customerHourlyRate = monthlyRate ? monthlyRate / 173.3 : 0;
          
          // Extract skills from JSON
          const extractedSkills = Array.isArray(candidate.skills) 
            ? candidate.skills.map((s: any) => s.name || s).filter(Boolean)
            : [];
          
          return {
            ...candidate,
            first_name: candidate.candidate_identity?.first_name || '',
            last_name: candidate.candidate_identity?.last_name || '',
            email: candidate.email || '',
            phone: candidate.phone,
            notes: candidate.bio || '',
            location: candidate.candidate_identity?.city || '',
            current_position: candidate.primary_role || '',
            experience_years: candidate.years_experience,
            skills: extractedSkills,
            languages: [],
            availability: candidate.availability,
            hourly_rate_min: customerHourlyRate,
            hourly_rate_max: customerHourlyRate,
            rating: 5,
            status: candidate.availability === 'immediately' ? 'available' : 'unavailable',
            category: candidate.category || undefined,
            customerMonthlyRate: monthlyRate,
          };
        });

        setSpecialists(transformedData);
        setFilteredSpecialists(transformedData);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: t('app.specialists.toasts.error'),
          description: t('app.specialists.toasts.unexpectedError'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, t, userData?.profile?.company_id]);

  useEffect(() => {
    let filtered = specialists;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(specialist => {
        const isAllocated = allocatedCandidateIds.has(specialist.id);
        // Only allow name search for allocated specialists
        const nameMatch = isAllocated && 
          `${specialist.first_name} ${specialist.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
        const positionMatch = specialist.current_position?.toLowerCase().includes(searchTerm.toLowerCase());
        const skillMatch = specialist.skills && specialist.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );
        // Only allow location search for allocated specialists
        const locationMatch = isAllocated && 
          specialist.location?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return nameMatch || positionMatch || skillMatch || locationMatch;
      });
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(specialist => specialist.status === availabilityFilter);
    }

    setFilteredSpecialists(filtered);
  }, [searchTerm, availabilityFilter, specialists, allocatedCandidateIds]);

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'unavailable':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available':
        return t('app.specialists.filter.available');
      case 'busy':
        return t('app.specialists.filter.busy');
      case 'unavailable':
        return t('app.specialists.filter.unavailable');
      default:
        return status || t('app.specialists.filter.unknown');
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'ki':
        return t('candidate.category.ki', 'KI');
      case 'it':
        return t('candidate.category.it', 'IT');
      case 'backoffice':
        return t('candidate.category.backoffice', 'Backoffice');
      default:
        return category;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Get recommended (allocated) specialists
  const recommendedSpecialists = filteredSpecialists.filter(s => allocatedCandidateIds.has(s.id));
  // Get all specialists for the "all" tab
  const allSpecialists = filteredSpecialists;

  const renderSpecialistCard = (specialist: Specialist, isAllocated: boolean) => (
    <Card 
      key={specialist.id} 
      className={cn(
        "hover:shadow-lg transition-all duration-300 cursor-pointer",
        !isAllocated && "bg-muted/30"
      )}
      onClick={() => navigate(`/app/specialists/${specialist.id}`)}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="" />
            <AvatarFallback className={cn(
              "text-lg font-semibold",
              isAllocated ? "bg-primary text-white" : "bg-muted-foreground/30 text-muted-foreground"
            )}>
              {getInitials(specialist.first_name, specialist.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className={cn(
                  "text-xl",
                  isAllocated ? "text-brand-dark" : "text-muted-foreground"
                )}>
                  {isAllocated 
                    ? `${specialist.first_name || ''} ${specialist.last_name || ''}`
                    : `${specialist.first_name?.[0] || ''}. ${specialist.last_name?.[0] || ''}.`
                  }
                  {!isAllocated && (
                    <Lock className="inline-block w-4 h-4 ml-2 text-muted-foreground" />
                  )}
                </CardTitle>
                <CardDescription className="text-base font-medium text-primary">
                  {specialist.current_position || t('app.specialists.card.positionNotSet')}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge className={getAvailabilityColor(specialist.status)}>
                  {getAvailabilityText(specialist.status)}
                </Badge>
                {specialist.category && (
                  <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100">
                    {getCategoryLabel(specialist.category)}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className={!isAllocated ? "blur-sm select-none" : ""}>
                  {isAllocated 
                    ? (specialist.location || t('app.specialists.card.locationNotSet'))
                    : "—"
                  }
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{specialist.experience_years || 0} {t('app.specialists.card.years')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{specialist.rating || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description - hidden for non-allocated */}
        {isAllocated ? (
          <p className="text-muted-foreground line-clamp-2">
            {specialist.notes || t('app.specialists.card.noDescription')}
          </p>
        ) : (
          <p className="text-muted-foreground/50 italic text-sm">
            {t('app.specialists.restricted.bioHidden')}
          </p>
        )}
        
        {/* Skills - always visible */}
        <div>
          <span className="font-medium text-sm mb-2 block">{t('app.specialists.card.skills')}</span>
          <div className="flex flex-wrap gap-2">
            {specialist.skills && specialist.skills.length > 0 ? (
              specialist.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">{t('app.specialists.card.noSkills')}</span>
            )}
          </div>
        </div>
        
        {/* Stats - always visible */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">{t('app.specialists.card.hourlyRate')}</span>
            <div className="text-primary font-semibold">
              {specialist.hourly_rate_min 
                ? `${specialist.hourly_rate_min.toFixed(2)} €`
                : t('app.specialists.card.rateNotSet')
              }
            </div>
          </div>
          <div>
            <span className="font-medium">{t('app.specialists.card.monthlyRate')}</span>
            <div className="text-primary font-semibold">
              {specialist.customerMonthlyRate 
                ? `${specialist.customerMonthlyRate.toLocaleString('de-DE')} €`
                : t('app.specialists.card.rateNotSet')
              }
            </div>
          </div>
          <div>
            <span className="font-medium">{t('app.specialists.card.experience')}</span>
            <div className="text-brand-dark font-semibold">{specialist.experience_years || 0} {t('app.specialists.card.years')}</div>
          </div>
        </div>
        
        {/* Consultant Contact Info - always visible */}
        <div>
          <span className="font-medium text-sm mb-2 block">{t('app.specialists.card.contactPerson')}</span>
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Pascal Spieß</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:pascal@hejtalent.de" className="hover:text-primary transition-colors">
                pascal@hejtalent.de
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <a href="tel:+4917634407838" className="hover:text-primary transition-colors">
                +49 176 34407838
              </a>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            size="sm" 
            variant={isAllocated ? "outline" : "secondary"}
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/app/specialists/${specialist.id}`);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isAllocated 
              ? t('app.specialists.card.viewProfile')
              : t('app.specialists.card.viewRestricted')
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">{t('app.specialists.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('app.specialists.subtitle')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="recommended">
            {t('app.specialists.tabs.recommended')} ({recommendedSpecialists.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            {t('app.specialists.tabs.all')} ({allSpecialists.length})
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex gap-4 items-center mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('app.specialists.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                {t('app.specialists.filter.availability')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setAvailabilityFilter('all')}>
                {t('app.specialists.filter.all')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAvailabilityFilter('available')}>
                {t('app.specialists.filter.available')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAvailabilityFilter('busy')}>
                {t('app.specialists.filter.busy')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAvailabilityFilter('unavailable')}>
                {t('app.specialists.filter.unavailable')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Recommended Tab */}
        <TabsContent value="recommended" className="mt-6">
          {recommendedSpecialists.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendedSpecialists.map((specialist) => 
                renderSpecialistCard(specialist, true)
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-dark mb-2">
                {t('app.specialists.empty.recommendedTitle')}
              </h3>
              <p className="text-muted-foreground">
                {t('app.specialists.empty.recommendedText')}
              </p>
            </div>
          )}
        </TabsContent>

        {/* All Specialists Tab */}
        <TabsContent value="all" className="mt-6">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-muted/50 border border-border rounded-lg flex items-start gap-3">
            <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('app.specialists.restricted.bannerTitle')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('app.specialists.restricted.bannerText')}
              </p>
            </div>
          </div>

          {allSpecialists.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {allSpecialists.map((specialist) => 
                renderSpecialistCard(specialist, allocatedCandidateIds.has(specialist.id))
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-dark mb-2">{t('app.specialists.empty.title')}</h3>
              <p className="text-muted-foreground">
                {t('app.specialists.empty.text')}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Specialists;