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
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const { data: resources, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching specialists:', error);
          toast({
            title: "Fehler",
            description: "Spezialisten konnten nicht geladen werden.",
            variant: "destructive",
          });
          return;
        }

        setSpecialists(resources || []);
        setFilteredSpecialists(resources || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Fehler",
          description: "Ein unerwarteter Fehler ist aufgetreten.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialists();
  }, [toast]);

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
        return 'Verfügbar';
      case 'busy':
        return 'Beschäftigt';
      case 'unavailable':
        return 'Nicht verfügbar';
      default:
        return status || 'Unbekannt';
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
          <h1 className="text-3xl font-bold text-brand-dark">Spezialisten</h1>
          <p className="text-muted-foreground mt-1">
            Entdecken Sie qualifizierte KI-Entwickler und Experten für Ihre Projekte
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Spezialisten durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Verfügbarkeit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setAvailabilityFilter('all')}>
              Alle Spezialisten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAvailabilityFilter('available')}>
              Verfügbar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAvailabilityFilter('busy')}>
              Beschäftigt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAvailabilityFilter('unavailable')}>
              Nicht verfügbar
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
                        {specialist.current_position || 'Position nicht angegeben'}
                      </CardDescription>
                    </div>
                    <Badge className={getAvailabilityColor(specialist.status)}>
                      {getAvailabilityText(specialist.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{specialist.location || 'Nicht angegeben'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{specialist.experience_years || 0} Jahre</span>
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
              <p className="text-muted-foreground">{specialist.notes || 'Keine Beschreibung verfügbar.'}</p>
              
              {/* Skills */}
              <div>
                <span className="font-medium text-sm mb-2 block">Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {specialist.skills && specialist.skills.length > 0 ? (
                    specialist.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">Keine Skills angegeben</span>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Stundensatz:</span>
                  <div className="text-primary font-semibold">
                    {specialist.hourly_rate_min && specialist.hourly_rate_max 
                      ? `${specialist.hourly_rate_min}-${specialist.hourly_rate_max} €`
                      : 'Nicht angegeben'
                    }
                  </div>
                </div>
                <div>
                  <span className="font-medium">Erfahrung:</span>
                  <div className="text-brand-dark font-semibold">{specialist.experience_years || 0} Jahre</div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{specialist.email || 'Nicht angegeben'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{specialist.phone || 'Nicht angegeben'}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate(`/app/specialists/${specialist.id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Vollständiges Profil
                </Button>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary-hover">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Kontakt aufnehmen
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSpecialists.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-dark mb-2">Keine Spezialisten gefunden</h3>
          <p className="text-muted-foreground">
            Versuchen Sie andere Suchbegriffe oder Filter, um passende Experten zu finden.
          </p>
        </div>
      )}
    </div>
  );
};

export default Specialists;