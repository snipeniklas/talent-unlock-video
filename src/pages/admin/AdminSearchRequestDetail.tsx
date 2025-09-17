import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Euro, Users, Calendar, Building2, User, FileText, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  location: string;
  employment_type: string;
  experience_level: string;
  experience_level_new: string;
  salary_min: number | null;
  salary_max: number | null;
  skills_required: string[];
  skills_list: string[];
  requirements: string;
  requirements_list: string[];
  main_tasks: string[];
  work_areas: string[];
  job_title: string;
  customer_industry: string;
  number_of_workers: number | null;
  weekly_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  company_id: string;
  created_by: string;
  company?: {
    name: string;
    email: string;
    website: string;
  };
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

const AdminSearchRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchRequest, setSearchRequest] = useState<SearchRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [allocationsCount, setAllocationsCount] = useState(0);

  useEffect(() => {
    const fetchSearchRequest = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Check if user is admin
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!userRoles || userRoles.role !== 'admin') {
          toast({
            title: "Zugriff verweigert",
            description: "Sie haben keine Berechtigung für diesen Bereich.",
            variant: "destructive",
          });
          navigate('/app/dashboard');
          return;
        }

        // Fetch search request
        const { data: request, error } = await supabase
          .from('search_requests')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error || !request) {
          console.error('Error fetching search request:', error);
          toast({
            title: "Fehler",
            description: "Suchauftrag konnte nicht geladen werden.",
            variant: "destructive",
          });
          navigate('/admin/search-requests');
          return;
        }

        // Fetch company info
        const { data: company } = await supabase
          .from('companies')
          .select('name, email, website')
          .eq('id', request.company_id)
          .single();

        // Fetch creator profile
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', request.created_by)
          .single();

        // Fetch allocations count
        const { count } = await supabase
          .from('search_request_allocations')
          .select('*', { count: 'exact', head: true })
          .eq('search_request_id', id);

        setAllocationsCount(count || 0);

        // Combine the data
        const combinedRequest: SearchRequest = {
          ...request,
          company: company || undefined,
          profile: creatorProfile || undefined
        };

        setSearchRequest(combinedRequest);
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Fehler",
          description: "Ein unerwarteter Fehler ist aufgetreten.",
          variant: "destructive",
        });
        navigate('/admin/search-requests');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchRequest();
  }, [id, navigate, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "paused": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Aktiv";
      case "pending": return "Ausstehend";
      case "completed": return "Abgeschlossen";
      case "cancelled": return "Abgebrochen";
      case "paused": return "Pausiert";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!searchRequest) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Suchauftrag nicht gefunden</h2>
          <p className="text-muted-foreground mt-2">Der angeforderte Suchauftrag existiert nicht.</p>
          <Button onClick={() => navigate("/admin/search-requests")} className="mt-4">
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate("/admin/search-requests")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{searchRequest.title}</h1>
          <p className="text-muted-foreground">{searchRequest.company?.name || 'Firma nicht verfügbar'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Grundinformationen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchRequest.job_title && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Job Titel</label>
                    <p className="text-sm">{searchRequest.job_title}</p>
                  </div>
                )}
                {searchRequest.customer_industry && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Branche</label>
                    <p className="text-sm">{searchRequest.customer_industry}</p>
                  </div>
                )}
                {searchRequest.number_of_workers && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Anzahl Mitarbeiter</label>
                    <p className="text-sm">{searchRequest.number_of_workers}</p>
                  </div>
                )}
                {searchRequest.weekly_hours && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Wochenstunden</label>
                    <p className="text-sm">{searchRequest.weekly_hours}h</p>
                  </div>
                )}
                {searchRequest.start_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Startdatum</label>
                    <p className="text-sm">{new Date(searchRequest.start_date).toLocaleDateString('de-DE')}</p>
                  </div>
                )}
                {searchRequest.end_date && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Enddatum</label>
                    <p className="text-sm">{new Date(searchRequest.end_date).toLocaleDateString('de-DE')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {searchRequest.description || 'Keine Beschreibung verfügbar.'}
              </p>
            </CardContent>
          </Card>

          {/* Main Tasks */}
          {searchRequest.main_tasks && searchRequest.main_tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hauptaufgaben</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {searchRequest.main_tasks.map((task, index) => (
                    <li key={index} className="text-muted-foreground">{task}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {((searchRequest.requirements && searchRequest.requirements.length > 0) || 
            (searchRequest.requirements_list && searchRequest.requirements_list.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>Anforderungen</CardTitle>
              </CardHeader>
              <CardContent>
                {searchRequest.requirements && (
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
                    {searchRequest.requirements}
                  </div>
                )}
                {searchRequest.requirements_list && searchRequest.requirements_list.length > 0 && (
                  <ul className="list-disc list-inside space-y-1">
                    {searchRequest.requirements_list.map((requirement, index) => (
                      <li key={index} className="text-muted-foreground">{requirement}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Erforderliche Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(searchRequest.skills_required || searchRequest.skills_list) && 
                 [...(searchRequest.skills_required || []), ...(searchRequest.skills_list || [])].length > 0 ? (
                  [...(searchRequest.skills_required || []), ...(searchRequest.skills_list || [])]
                    .filter((skill, index, self) => self.indexOf(skill) === index) // Remove duplicates
                    .map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))
                ) : (
                  <p className="text-muted-foreground">Keine Skills angegeben</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Areas */}
          {searchRequest.work_areas && searchRequest.work_areas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Arbeitsbereiche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {searchRequest.work_areas.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getStatusColor(searchRequest.status)}>
                  {getStatusText(searchRequest.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/admin/search-requests/${id}/allocations`)}
                >
                  Zuweisungen verwalten ({allocationsCount})
                </Button>
                <Button variant="outline" className="w-full">
                  Bearbeiten
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{searchRequest.location || 'Nicht angegeben'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {searchRequest.salary_min && searchRequest.salary_max 
                    ? `€${searchRequest.salary_min.toLocaleString()} - €${searchRequest.salary_max.toLocaleString()}`
                    : 'Nicht angegeben'
                  }
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{allocationsCount} Zuweisungen</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Erstellt: {new Date(searchRequest.created_at).toLocaleDateString('de-DE')}</span>
              </div>
              {searchRequest.employment_type && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Arbeitstyp: {
                      searchRequest.employment_type === 'full_time' ? 'Vollzeit' :
                      searchRequest.employment_type === 'part_time' ? 'Teilzeit' :
                      searchRequest.employment_type === 'contract' ? 'Vertrag' :
                      searchRequest.employment_type === 'freelance' ? 'Freelance' :
                      searchRequest.employment_type
                    }
                  </span>
                </div>
              )}
              {(searchRequest.experience_level || searchRequest.experience_level_new) && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Erfahrung: {searchRequest.experience_level_new || searchRequest.experience_level}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          {searchRequest.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Unternehmen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{searchRequest.company.name}</p>
                {searchRequest.company.email && (
                  <p className="text-sm text-muted-foreground">{searchRequest.company.email}</p>
                )}
                {searchRequest.company.website && (
                  <p className="text-sm text-muted-foreground">{searchRequest.company.website}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Person */}
          {searchRequest.profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Ansprechpartner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {`${searchRequest.profile.first_name || ''} ${searchRequest.profile.last_name || ''}`}
                </p>
                {searchRequest.profile.email && (
                  <p className="text-sm text-muted-foreground">{searchRequest.profile.email}</p>
                )}
                <p className="text-sm text-muted-foreground">{searchRequest.company?.name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSearchRequestDetail;