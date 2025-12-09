import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Briefcase, 
  Calendar,
  Mail,
  Phone,
  Eye,
  UserPlus
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
}

const Specialists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
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

        // Transform candidate data to match specialist interface
        const transformedData = (resources || []).map((candidate: any) => {
          // Calculate customer hourly rate (selling price)
          const baseMonthlyRate = candidate.rate_monthly_target || 0;
          const margin = candidate.margin || 0;
          const monthlyRate = baseMonthlyRate + margin;
          const hoursPerWeek = candidate.hours_per_week_pref || 40;
          const hoursPerMonth = hoursPerWeek * 4;
          const customerHourlyRate = monthlyRate && hoursPerMonth ? monthlyRate / hoursPerMonth : 0;
          
          return {
            ...candidate,
            first_name: candidate.candidate_identity?.first_name || '',
            last_name: candidate.candidate_identity?.last_name || '',
            email: candidate.email || '',
            phone: candidate.phone,
            location: candidate.candidate_identity?.city || '',
            current_position: candidate.primary_role || '',
            experience_years: candidate.years_experience,
            skills: [], // We'll need to extract from skills JSON
            languages: [], // We'll need to get from candidate_languages
            availability: candidate.availability,
            hourly_rate_min: customerHourlyRate,
            hourly_rate_max: customerHourlyRate,
            rating: 5, // Default rating
            status: candidate.availability === 'immediately' ? 'available' : 'unavailable'
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

    fetchSpecialists();
  }, [toast, t]);

  useEffect(() => {
    let filtered = specialists;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(specialist =>
        `${specialist.first_name} ${specialist.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialist.current_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (specialist.skills && specialist.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        specialist.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by availability (map status to availability)
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(specialist => specialist.status === availabilityFilter);
    }

    setFilteredSpecialists(filtered);
  }, [searchTerm, availabilityFilter, specialists]);

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

      {/* Filters */}
      <div className="flex gap-4 items-center">
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

      {/* Specialists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSpecialists.map((specialist) => (
          <Card key={specialist.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg font-semibold bg-primary text-white">
                    {`${specialist.first_name?.[0] || ''}${specialist.last_name?.[0] || ''}`}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-brand-dark">
                        {`${specialist.first_name || ''} ${specialist.last_name || ''}`}
                      </CardTitle>
                      <CardDescription className="text-base font-medium text-primary">
                        {specialist.current_position || t('app.specialists.card.positionNotSet')}
                      </CardDescription>
                    </div>
                    <Badge className={getAvailabilityColor(specialist.status)}>
                      {getAvailabilityText(specialist.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{specialist.location || t('app.specialists.card.locationNotSet')}</span>
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
              {/* Description */}
              <p className="text-muted-foreground">{specialist.notes || t('app.specialists.card.noDescription')}</p>
              
              {/* Skills */}
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
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <span className="font-medium">{t('app.specialists.card.experience')}</span>
                  <div className="text-brand-dark font-semibold">{specialist.experience_years || 0} {t('app.specialists.card.years')}</div>
                </div>
              </div>
              
              {/* Consultant Contact Info */}
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
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/app/specialists/${specialist.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t('app.specialists.card.viewProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpecialists.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-dark mb-2">{t('app.specialists.empty.title')}</h3>
          <p className="text-muted-foreground">
            {t('app.specialists.empty.text')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Specialists;
