import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface SearchRequest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  location: string;
  budget: string;
  requiredSkills: string[];
  applicants: number;
  createdAt: string;
  deadline: string;
}

const SearchRequests = () => {
  const navigate = useNavigate();
  const [searchRequests, setSearchRequests] = useState<SearchRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SearchRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData: SearchRequest[] = [
      {
        id: '1',
        title: 'Senior AI Engineer für Computer Vision Projekt',
        description: 'Wir suchen einen erfahrenen KI-Entwickler für ein spannendes Computer Vision Projekt im Bereich autonomes Fahren.',
        status: 'active',
        location: 'München, Deutschland',
        budget: '80.000 - 120.000 €',
        requiredSkills: ['Python', 'TensorFlow', 'Computer Vision', 'Deep Learning'],
        applicants: 12,
        createdAt: '2024-01-15',
        deadline: '2024-02-15'
      },
      {
        id: '2',
        title: 'Machine Learning Spezialist - NLP',
        description: 'Für unser neues Chatbot-Projekt benötigen wir einen ML-Experten mit Fokus auf Natural Language Processing.',
        status: 'pending',
        location: 'Remote',
        budget: '70.000 - 90.000 €',
        requiredSkills: ['Python', 'NLTK', 'spaCy', 'Transformers', 'PyTorch'],
        applicants: 8,
        createdAt: '2024-01-10',
        deadline: '2024-02-01'
      },
      {
        id: '3',
        title: 'Data Scientist für Predictive Analytics',
        description: 'Entwicklung von Vorhersagemodellen für unsere E-Commerce-Plattform zur Optimierung der Kundenexperience.',
        status: 'completed',
        location: 'Berlin, Deutschland',
        budget: '65.000 - 85.000 €',
        requiredSkills: ['R', 'Python', 'SQL', 'Tableau', 'Statistics'],
        applicants: 15,
        createdAt: '2023-12-20',
        deadline: '2024-01-20'
      }
    ];

    setSearchRequests(mockData);
    setFilteredRequests(mockData);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = searchRequests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requiredSkills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, searchRequests]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'pending':
        return 'Ausstehend';
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Abgebrochen';
      default:
        return status;
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
          <h1 className="text-3xl font-bold text-brand-dark">Suchaufträge</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Ihre Stellenausschreibungen und finden Sie die besten Kandidaten
          </p>
        </div>
        <Button onClick={() => navigate('/app/search-requests/new')} className="bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          Neue Anfrage
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Suchaufträge durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              Alle Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('active')}>
              Aktiv
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
              Ausstehend
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
              Abgeschlossen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Requests Grid */}
      <div className="grid gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl text-brand-dark mb-2">{request.title}</CardTitle>
                  <CardDescription className="text-base line-clamp-2">
                    {request.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Ansehen
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Bearbeiten
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Request Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{request.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{request.applicants} Bewerber</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Deadline: {new Date(request.deadline).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <span className="font-medium">Budget: </span>
                  <span className="text-primary font-semibold">{request.budget}</span>
                </div>

                {/* Required Skills */}
                <div>
                  <span className="font-medium mb-2 block">Erforderliche Skills:</span>
                  <div className="flex flex-wrap gap-2">
                    {request.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/app/search-requests/${request.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Details ansehen
                  </Button>
                  <Button size="sm" variant="outline">
                    Bewerber verwalten ({request.applicants})
                  </Button>
                  {request.status === 'active' && (
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-dark mb-2">Keine Suchaufträge gefunden</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
              : 'Erstellen Sie Ihren ersten Suchauftrag, um loszulegen.'
            }
          </p>
          <Button onClick={() => navigate('/app/search-requests/new')} className="bg-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            Erste Anfrage erstellen
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchRequests;