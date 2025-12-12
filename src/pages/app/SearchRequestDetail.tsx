import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Euro, Users, Calendar, Phone, Mail, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/i18n";

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
  const { t, get, lang } = useTranslation();

  // German work area names (stored in DB) mapped to translation keys
  const workAreaTranslations: Record<string, string> = {
    'IT-Support': get<string[]>('app.newRequest.predefinedWorkAreas', [])[0] || 'IT-Support',
    'Mahnwesen': get<string[]>('app.newRequest.predefinedWorkAreas', [])[1] || 'Mahnwesen',
    'Buchhaltung': get<string[]>('app.newRequest.predefinedWorkAreas', [])[2] || 'Buchhaltung',
    'Kundenservice': get<string[]>('app.newRequest.predefinedWorkAreas', [])[3] || 'Kundenservice',
    'Datenverarbeitung': get<string[]>('app.newRequest.predefinedWorkAreas', [])[4] || 'Datenverarbeitung',
    'Qualitätssicherung': get<string[]>('app.newRequest.predefinedWorkAreas', [])[5] || 'Qualitätssicherung',
    'Projektmanagement': get<string[]>('app.newRequest.predefinedWorkAreas', [])[6] || 'Projektmanagement',
    'Marketing': get<string[]>('app.newRequest.predefinedWorkAreas', [])[7] || 'Marketing',
    'Vertrieb': get<string[]>('app.newRequest.predefinedWorkAreas', [])[8] || 'Vertrieb',
  };

  // Dynamically translate stored German text parts to current language
  const translateTitle = (title: string) => {
    const remoteWorkerTranslation = t('app.newRequest.remoteWorker', 'Remote-Mitarbeiter');
    return title.replace(/Remote-Mitarbeiter/g, remoteWorkerTranslation);
  };

  const translateDescription = (description: string | null) => {
    if (!description) return '';
    const workAreasLabel = t('app.newRequest.workAreasLabel', 'Benötigte Arbeitsbereiche');
    let translated = description.replace(/Benötigte Arbeitsbereiche/g, workAreasLabel);
    // Translate individual work area names
    Object.entries(workAreaTranslations).forEach(([german, translated_value]) => {
      translated = translated.replace(new RegExp(german, 'g'), translated_value);
    });
    return translated;
  };

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
            title: t('app.searchRequestDetail.toast.error'),
            description: t('app.searchRequestDetail.toast.noCompany'),
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
            title: t('app.searchRequestDetail.toast.error'),
            description: t('app.searchRequestDetail.toast.loadFailed'),
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
          title: t('app.searchRequestDetail.toast.error'),
          description: t('app.searchRequestDetail.toast.unexpected'),
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
      case "active": return t('app.searchRequestDetail.status.active');
      case "pending": return t('app.searchRequestDetail.status.pending');
      case "completed": return t('app.searchRequestDetail.status.completed');
      case "cancelled": return t('app.searchRequestDetail.status.cancelled');
      case "paused": return t('app.searchRequestDetail.status.paused');
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
          <h2 className="text-2xl font-bold">{t('app.searchRequestDetail.notFound.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('app.searchRequestDetail.notFound.text')}</p>
          <Button onClick={() => navigate("/app/search-requests")} className="mt-4">
            {t('app.searchRequestDetail.notFound.back')}
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
          <h1 className="text-3xl font-bold">{translateTitle(searchRequest.title)}</h1>
          <p className="text-muted-foreground">{searchRequest.company?.name || t('app.searchRequestDetail.companyNotAvailable')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>{t('app.searchRequestDetail.cards.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {translateDescription(searchRequest.description) || t('app.searchRequestDetail.cards.noDescription')}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {searchRequest.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>{t('app.searchRequestDetail.cards.requirements')}</CardTitle>
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
              <CardTitle>{t('app.searchRequestDetail.cards.skills')}</CardTitle>
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
                  <p className="text-muted-foreground">{t('app.searchRequestDetail.cards.noSkills')}</p>
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
              <CardTitle>{t('app.searchRequestDetail.sidebar.statusActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('app.searchRequestDetail.sidebar.status')}</span>
                <Badge className={getStatusColor(searchRequest.status)}>
                  {getStatusText(searchRequest.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/app/search-requests/${id}/candidates`)}
                >
                  {t('app.searchRequestDetail.sidebar.manageCandidates')}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      {t('app.searchRequestDetail.sidebar.help')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t('app.searchRequestDetail.helpDialog.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{t('app.searchRequestDetail.helpDialog.consultant')}</span>
                        <span>Pascal Spieß</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href="tel:+4917634407838" className="text-primary hover:underline">
                          +49 176 34407838
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href="mailto:pascal@hejtalent.de" className="text-primary hover:underline">
                          pascal@hejtalent.de
                        </a>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => window.open('https://calendly.com/pascal-hejtalent/15min', '_blank')}
                      >
                        <CalendarDays className="h-4 w-4 mr-2" />
                        {t('app.searchRequestDetail.helpDialog.bookAppointment')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('app.searchRequestDetail.sidebar.details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{searchRequest.location || t('app.searchRequestDetail.sidebar.notProvided')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {searchRequest.salary_min && searchRequest.salary_max 
                    ? `€${searchRequest.salary_min.toLocaleString()} - €${searchRequest.salary_max.toLocaleString()}`
                    : t('app.searchRequestDetail.sidebar.notProvided')
                  }
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t('app.searchRequestDetail.sidebar.applicants')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t('app.searchRequestDetail.sidebar.created')} {new Date(searchRequest.created_at).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'nl' ? 'nl-NL' : 'en-US')}</span>
              </div>
              {searchRequest.employment_type && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t('app.searchRequestDetail.sidebar.employmentType')} {t(`app.searchRequestDetail.employmentTypes.${searchRequest.employment_type}`)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Person */}
          {searchRequest.profile && (
            <Card>
              <CardHeader>
                <CardTitle>{t('app.searchRequestDetail.sidebar.contactPerson')}</CardTitle>
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