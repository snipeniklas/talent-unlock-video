import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Euro, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchRequest {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "completed" | "paused";
  location: string;
  budget: string;
  requiredSkills: string[];
  applicants: number;
  createdAt: string;
  deadline: string;
  contactPerson?: string;
  company?: string;
  requirements?: string[];
  benefits?: string[];
}

const SearchRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchRequest, setSearchRequest] = useState<SearchRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockData: SearchRequest = {
        id: id || "1",
        title: "Senior Frontend Developer",
        description: "Wir suchen einen erfahrenen Frontend-Entwickler für die Entwicklung moderner Web-Anwendungen mit React und TypeScript. Der Kandidat sollte mindestens 5 Jahre Berufserfahrung mitbringen und bereits komplexe Single-Page-Applications entwickelt haben.",
        status: "open",
        location: "München, Deutschland",
        budget: "€80.000 - €95.000",
        requiredSkills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Git", "REST APIs"],
        applicants: 12,
        createdAt: "2024-01-15",
        deadline: "2024-02-15",
        contactPerson: "Anna Schmidt",
        company: "TechCorp GmbH",
        requirements: [
          "Mindestens 5 Jahre Erfahrung in der Frontend-Entwicklung",
          "Expertise in React und TypeScript",
          "Erfahrung mit modernen Build-Tools (Webpack, Vite)",
          "Kenntnisse in responsive Design und CSS-Frameworks",
          "Teamfähigkeit und agile Arbeitsweise"
        ],
        benefits: [
          "Flexible Arbeitszeiten und Home-Office Möglichkeit",
          "30 Tage Urlaub",
          "Weiterbildungsbudget von €2.000 pro Jahr",
          "Moderne Arbeitsplätze und neueste Technologien",
          "Teamevents und kostenfreie Getränke"
        ]
      };
      setSearchRequest(mockData);
      setLoading(false);
    }, 500);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800 border-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
      case "paused": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Offen";
      case "in_progress": return "In Bearbeitung";
      case "completed": return "Abgeschlossen";
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
          <p className="text-muted-foreground">{searchRequest.company}</p>
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
                {searchRequest.description}
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
                <ul className="space-y-2">
                  {searchRequest.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {searchRequest.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Was wir bieten</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {searchRequest.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
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
                {searchRequest.requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
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
                <Button className="w-full">
                  Bewerben
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
                <span className="text-sm">{searchRequest.location}</span>
              </div>
              <div className="flex items-center gap-3">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{searchRequest.budget}</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{searchRequest.applicants} Bewerber</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Erstellt: {new Date(searchRequest.createdAt).toLocaleDateString('de-DE')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Deadline: {new Date(searchRequest.deadline).toLocaleDateString('de-DE')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Person */}
          {searchRequest.contactPerson && (
            <Card>
              <CardHeader>
                <CardTitle>Ansprechpartner</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{searchRequest.contactPerson}</p>
                <p className="text-sm text-muted-foreground">{searchRequest.company}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchRequestDetail;