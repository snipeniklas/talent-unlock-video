import { useState, useEffect } from 'react';
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

interface Specialist {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  location: string;
  experience: number;
  rating: number;
  skills: string[];
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate: string;
  description: string;
  completedProjects: number;
  email: string;
  phone: string;
}

const Specialists = () => {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filteredSpecialists, setFilteredSpecialists] = useState<Specialist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: Specialist[] = [
      {
        id: '1',
        name: 'Dr. Max Mustermann',
        title: 'Senior AI Engineer',
        location: 'München, Deutschland',
        experience: 8,
        rating: 4.9,
        skills: ['Python', 'TensorFlow', 'Computer Vision', 'Deep Learning', 'PyTorch'],
        availability: 'available',
        hourlyRate: '120-150 €',
        description: 'Spezialist für Computer Vision und Deep Learning mit 8 Jahren Erfahrung in der Automobilindustrie.',
        completedProjects: 24,
        email: 'max.mustermann@example.com',
        phone: '+49 89 123456789'
      },
      {
        id: '2',
        name: 'Sarah Schmidt',
        title: 'Machine Learning Spezialist',
        location: 'Berlin, Deutschland',
        experience: 6,
        rating: 4.8,
        skills: ['Python', 'Scikit-learn', 'NLP', 'Data Mining', 'Statistics'],
        availability: 'busy',
        hourlyRate: '100-130 €',
        description: 'Expertin für Natural Language Processing und Data Science mit Fokus auf E-Commerce Anwendungen.',
        completedProjects: 18,
        email: 'sarah.schmidt@example.com',
        phone: '+49 30 987654321'
      },
      {
        id: '3',
        name: 'Dr. Anna Weber',
        title: 'Data Scientist',
        location: 'Hamburg, Deutschland',
        experience: 10,
        rating: 5.0,
        skills: ['R', 'Python', 'SQL', 'Tableau', 'Big Data', 'AWS'],
        availability: 'available',
        hourlyRate: '140-180 €',
        description: 'Führende Expertin für Big Data Analytics und Cloud Computing mit PhD in Statistik.',
        completedProjects: 32,
        email: 'anna.weber@example.com',
        phone: '+49 40 555666777'
      },
      {
        id: '4',
        name: 'Thomas Müller',
        title: 'AI Research Engineer',
        location: 'Remote',
        experience: 5,
        rating: 4.7,
        skills: ['Python', 'PyTorch', 'Reinforcement Learning', 'Neural Networks', 'Mathematics'],
        availability: 'available',
        hourlyRate: '90-120 €',
        description: 'Forschungsingenieur mit Schwerpunkt auf Reinforcement Learning und neuronale Netzwerke.',
        completedProjects: 12,
        email: 'thomas.mueller@example.com',
        phone: '+49 711 333444555'
      }
    ];

    setSpecialists(mockData);
    setFilteredSpecialists(mockData);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = specialists;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(specialist =>
        specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialist.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        specialist.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by availability
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(specialist => specialist.availability === availabilityFilter);
    }

    setFilteredSpecialists(filtered);
  }, [searchTerm, availabilityFilter, specialists]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
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

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Verfügbar';
      case 'busy':
        return 'Beschäftigt';
      case 'unavailable':
        return 'Nicht verfügbar';
      default:
        return availability;
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
                  <AvatarImage src={specialist.avatar} />
                  <AvatarFallback className="text-lg font-semibold bg-primary text-white">
                    {specialist.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-brand-dark">{specialist.name}</CardTitle>
                      <CardDescription className="text-base font-medium text-primary">
                        {specialist.title}
                      </CardDescription>
                    </div>
                    <Badge className={getAvailabilityColor(specialist.availability)}>
                      {getAvailabilityText(specialist.availability)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{specialist.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{specialist.experience} Jahre</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{specialist.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-muted-foreground">{specialist.description}</p>
              
              {/* Skills */}
              <div>
                <span className="font-medium text-sm mb-2 block">Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {specialist.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Stundensatz:</span>
                  <div className="text-primary font-semibold">{specialist.hourlyRate}</div>
                </div>
                <div>
                  <span className="font-medium">Projekte:</span>
                  <div className="text-brand-dark font-semibold">{specialist.completedProjects} abgeschlossen</div>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{specialist.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{specialist.phone}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button size="sm" variant="outline" className="flex-1">
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