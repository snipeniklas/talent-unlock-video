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
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n/i18n';

interface SearchRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  skills_required: string[];
  created_at: string;
  company_id: string;
  created_by: string;
  candidate_count?: number;
}

const SearchRequests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchRequests, setSearchRequests] = useState<SearchRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SearchRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { t, lang } = useTranslation();

  useEffect(() => {
    const fetchSearchRequests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        setCurrentUserId(user.id);

        // Get user's company and roles
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', user.id)
          .single();

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        setUserRoles(roles?.map(r => r.role) || []);

        if (!profile?.company_id) {
          toast({
            title: t('app.searchRequests.toasts.error', 'Fehler'),
            description: t('app.searchRequests.toasts.errorCompany', 'Keine Firma gefunden. Bitte kontaktieren Sie den Support.'),
            variant: 'destructive',
          });
          return;
        }

        // Fetch search requests for the company
        const { data: requests, error } = await supabase
          .from('search_requests')
          .select('id, title, description, status, location, employment_type, experience_level, salary_min, salary_max, skills_required, created_at, company_id, created_by')
          .eq('company_id', profile.company_id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching search requests:', error);
          toast({
            title: t('app.searchRequests.toasts.error', 'Fehler'),
            description: t('app.searchRequests.toasts.loadFailed', 'Suchaufträge konnten nicht geladen werden.'),
            variant: 'destructive',
          });
          return;
        }

        // Fetch allocations count for each search request
        const requestsWithCounts = await Promise.all(
          (requests || []).map(async (request) => {
            const { data: allocations } = await supabase
              .from('search_request_allocations')
              .select('id')
              .eq('search_request_id', request.id);
            
            return {
              ...request,
              candidate_count: allocations?.length || 0
            };
          })
        );

        setSearchRequests(requestsWithCounts || []);
        setFilteredRequests(requestsWithCounts || []);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: t('app.searchRequests.toasts.error', 'Fehler'),
          description: t('app.searchRequests.toasts.unexpected', 'Ein unerwarteter Fehler ist aufgetreten.'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSearchRequests();
  }, [navigate, toast, t]);

  useEffect(() => {
    let filtered = searchRequests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.skills_required && request.skills_required.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, searchRequests]);

  const canDeleteRequest = (request: SearchRequest) => {
    if (userRoles.includes('admin')) return true;
    if (userRoles.includes('company_admin')) return true;
    return request.created_by === currentUserId;
  };

  const canEditRequest = () => {
    return userRoles.includes('admin');
  };


  const handleDeleteRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('search_requests')
        .delete()
        .eq('id', requestId);

      if (error) {
        console.error('Error deleting search request:', error);
        toast({
          title: t('app.searchRequests.toasts.error', 'Fehler'),
          description: t('app.searchRequests.toasts.deleteFailed', 'Suchauftrag konnte nicht gelöscht werden.'),
          variant: 'destructive',
        });
        return;
      }

      setSearchRequests(prev => prev.filter(req => req.id !== requestId));
      setFilteredRequests(prev => prev.filter(req => req.id !== requestId));

      toast({
        title: t('app.searchRequests.toasts.deleteSuccessTitle', 'Erfolg'),
        description: t('app.searchRequests.toasts.deleteSuccess', 'Suchauftrag wurde erfolgreich gelöscht.'),
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t('app.searchRequests.toasts.error', 'Fehler'),
        description: t('app.searchRequests.toasts.unexpected', 'Ein unerwarteter Fehler ist aufgetreten.'),
        variant: 'destructive',
      });
    }
  };

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
        return t('app.status.active', 'Aktiv');
      case 'pending':
        return t('app.status.pending', 'Ausstehend');
      case 'completed':
        return t('app.status.completed', 'Abgeschlossen');
      case 'cancelled':
        return t('app.status.cancelled', 'Abgebrochen');
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

  const locale = lang === 'en' ? 'en-US' : 'de-DE';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">{t('app.searchRequests.title', 'Suchaufträge')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('app.searchRequests.subtitle', 'Verwalten Sie Ihre Stellenausschreibungen und finden Sie die besten Kandidaten')}
          </p>
        </div>
        <Button onClick={() => navigate('/app/search-requests/new')} className="bg-primary hover:bg-primary-hover">
          <Plus className="w-4 h-4 mr-2" />
          {t('app.searchRequests.new', 'Neue Anfrage')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('app.searchRequests.searchPlaceholder', 'Suchaufträge durchsuchen...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              {t('app.searchRequests.filters.status', 'Status')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              {t('app.searchRequests.filters.all', 'Alle Status')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('active')}>
              {t('app.searchRequests.filters.active', 'Aktiv')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
              {t('app.searchRequests.filters.pending', 'Ausstehend')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
              {t('app.searchRequests.filters.completed', 'Abgeschlossen')}
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
                      <DropdownMenuItem onClick={() => navigate(`/app/search-requests/${request.id}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        {t('common.actions.view', 'Ansehen')}
                      </DropdownMenuItem>
                      {canEditRequest() && (
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('common.actions.edit', 'Bearbeiten')}
                        </DropdownMenuItem>
                      )}
                      {canDeleteRequest(request) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('common.actions.delete', 'Löschen')}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('app.searchRequests.confirmDelete.title', 'Suchauftrag löschen')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('app.searchRequests.confirmDelete.desc', 'Sind Sie sicher, dass Sie diesen Suchauftrag löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.actions.cancel', 'Abbrechen')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRequest(request.id)}>
                                {t('common.actions.delete', 'Löschen')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
                    <span>{request.location || t('app.searchRequests.details.locationUnknown', 'Nicht angegeben')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{request.candidate_count || 0} {t('app.searchRequests.details.candidates', 'Kandidaten')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{t('app.searchRequests.details.created', 'Erstellt:')} {new Date(request.created_at).toLocaleDateString(locale)}</span>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <span className="font-medium">{t('app.searchRequests.details.budget', 'Budget:')} </span>
                  <span className="text-primary font-semibold">
                    {request.salary_min && request.salary_max 
                      ? `${request.salary_min.toLocaleString()} - ${request.salary_max.toLocaleString()} €`
                      : t('app.searchRequests.details.notProvided', 'Nicht angegeben')
                    }
                  </span>
                </div>

                {/* Required Skills */}
                <div>
                  <span className="font-medium mb-2 block">{t('app.searchRequests.details.requiredSkills', 'Erforderliche Skills:')}</span>
                  <div className="flex flex-wrap gap-2">
                    {request.skills_required && request.skills_required.length > 0 ? (
                      request.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">{t('app.searchRequests.details.noSkills', 'Keine Skills angegeben')}</span>
                    )}
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
                    {t('app.searchRequests.details.view', 'Details ansehen')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate(`/app/search-requests/${request.id}/candidates`)}
                  >
                    {t('app.searchRequests.details.manageCandidates', 'Kandidaten verwalten')} ({request.candidate_count || 0})
                  </Button>
                  {canEditRequest() && request.status === 'active' && (
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      {t('common.actions.edit', 'Bearbeiten')}
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
          <h3 className="text-lg font-semibold text-brand-dark mb-2">{t('app.searchRequests.empty.title', 'Keine Suchaufträge gefunden')}</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? t('app.searchRequests.empty.filtered', 'Versuchen Sie andere Suchbegriffe oder Filter.')
              : t('app.searchRequests.empty.start', 'Erstellen Sie Ihren ersten Suchauftrag, um loszulegen.')
            }
          </p>
          <Button onClick={() => navigate('/app/search-requests/new')} className="bg-primary hover:bg-primary-hover">
            <Plus className="w-4 h-4 mr-2" />
            {t('app.searchRequests.empty.btn', 'Erste Anfrage erstellen')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchRequests;