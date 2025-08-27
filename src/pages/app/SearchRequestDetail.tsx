import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Euro, Users, Calendar } from "lucide-react";
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
  salary_min: number | null;
  salary_max: number | null;
  skills_required: string[];
  requirements: string;
  created_at: string;
  company_id: string;
  created_by: string;
  company?: {
    name: string;
    email: string;
  };
  profile?: {
    first_name: string;
    last_name: string;
  } | null;
}

const SearchRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchRequest, setSearchRequest] = useState<SearchRequest | null>(null);
  const [loading, setLoading] = useState(true);

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

        // Get user's company to verify access
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
          navigate('/app/search-requests');
          return;
        }

        // Fetch search request first
        const { data: request, error } = await supabase
          .from('search_requests')
          .select('*')
          .eq('id', id)
          .eq('company_id', profile.company_id)
          .maybeSingle();

        if (error || !request) {
          console.error('Error fetching search request:', error);
          toast({
            title: "Fehler",
            description: "Suchauftrag konnte nicht geladen werden.",
            variant: "destructive",
          });
          navigate('/app/search-requests');
          return;
        }

        // Fetch company info separately
        const { data: company } = await supabase
          .from('companies')
          .select('name, email')
          .eq('id', request.company_id)
          .single();

        // Fetch creator profile separately
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', request.created_by)
          .single();

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
        navigate('/app/search-requests');
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
          <Button onClick={() => navigate("/app/search-requests")} className="mt-4">
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
          onClick={() => navigate("/app/search-requests")}
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

          {/* Requirements */}
          {searchRequest.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Anforderungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {searchRequest.requirements}
                </div>
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
                {searchRequest.skills_required && searchRequest.skills_required.length > 0 ? (
                  searchRequest.skills_required.map((skill, index) => (
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
                  onClick={() => navigate(`/app/search-requests/${id}/candidates`)}
                >
                  Kandidaten verwalten
                </Button>
                <Button variant="outline" className="w-full">
                  Kontakt aufnehmen
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
                <span className="text-sm">0 Bewerber</span>
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
            </CardContent>
          </Card>

          {/* Contact Person */}
          {searchRequest.profile && (
            <Card>
              <CardHeader>
                <CardTitle>Ansprechpartner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">
                  {`${searchRequest.profile.first_name || ''} ${searchRequest.profile.last_name || ''}`}
                </p>
                <p className="text-sm text-muted-foreground">{searchRequest.company?.name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRequestDetail;