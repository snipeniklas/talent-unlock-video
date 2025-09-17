import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, MessageSquare, Check, X, Star, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience: string;
  skills: string[];
  status: "new" | "reviewed" | "shortlisted" | "interview" | "accepted" | "rejected";
  appliedAt: string;
  rating?: number;
  cvUrl?: string;
  coverLetter?: string;
  location: string;
  expectedSalary?: string;
}

interface SearchRequest {
  id: string;
  title: string;
  company: string;
  status: string;
  applicantCount: number;
}

const ApplicantManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchRequest, setSearchRequest] = useState<SearchRequest | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    // Mock data - replace with actual API calls
    setTimeout(() => {
      const mockSearchRequest: SearchRequest = {
        id: id || "1",
        title: "Senior Frontend Developer",
        company: "TechCorp GmbH",
        status: "open",
        applicantCount: 15
      };

      const mockApplicants: Applicant[] = [
        {
          id: "1",
          name: "Max Mustermann",
          email: "max.mustermann@email.com",
          phone: "+49 123 456789",
          experience: "5+ Jahre",
          skills: ["React", "TypeScript", "Node.js", "GraphQL"],
          status: "new",
          appliedAt: "2024-01-20",
          location: "München",
          expectedSalary: "€75.000",
          coverLetter: "Sehr geehrte Damen und Herren, hiermit bewerbe ich mich..."
        },
        {
          id: "2",
          name: "Anna Schmidt",
          email: "anna.schmidt@email.com",
          phone: "+49 987 654321",
          experience: "7+ Jahre",
          skills: ["React", "TypeScript", "Python", "AWS"],
          status: "shortlisted",
          appliedAt: "2024-01-18",
          rating: 4,
          location: "Berlin",
          expectedSalary: "€85.000"
        },
        {
          id: "3",
          name: "Tim Weber",
          email: "tim.weber@email.com",
          experience: "3+ Jahre",
          skills: ["Vue.js", "JavaScript", "PHP"],
          status: "reviewed",
          appliedAt: "2024-01-15",
          rating: 3,
          location: "Hamburg",
          expectedSalary: "€60.000"
        }
      ];

      setSearchRequest(mockSearchRequest);
      setApplicants(mockApplicants);
      setLoading(false);
    }, 500);
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "reviewed": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shortlisted": return "bg-green-100 text-green-800 border-green-200";
      case "interview": return "bg-purple-100 text-purple-800 border-purple-200";
      case "accepted": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "new": return "Neu";
      case "reviewed": return "Geprüft";
      case "shortlisted": return "Vorauswahl";
      case "interview": return "Interview";
      case "accepted": return "Angenommen";
      case "rejected": return "Abgelehnt";
      default: return status;
    }
  };

  const filteredApplicants = selectedStatus === "all" 
    ? applicants 
    : applicants.filter(applicant => applicant.status === selectedStatus);

  const statusCounts = {
    all: applicants.length,
    new: applicants.filter(a => a.status === "new").length,
    reviewed: applicants.filter(a => a.status === "reviewed").length,
    shortlisted: applicants.filter(a => a.status === "shortlisted").length,
    interview: applicants.filter(a => a.status === "interview").length,
    accepted: applicants.filter(a => a.status === "accepted").length,
    rejected: applicants.filter(a => a.status === "rejected").length,
  };

  const updateApplicantStatus = (applicantId: string, newStatus: Applicant["status"]) => {
    setApplicants(prev => 
      prev.map(applicant => 
        applicant.id === applicantId 
          ? { ...applicant, status: newStatus }
          : applicant
      )
    );
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
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
          onClick={() => navigate(`/app/search-requests/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bewerber verwalten</h1>
          <p className="text-muted-foreground">{searchRequest.title} - {searchRequest.company}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">
            Alle ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="new">
            Neu ({statusCounts.new})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Geprüft ({statusCounts.reviewed})
          </TabsTrigger>
          <TabsTrigger value="shortlisted">
            Vorauswahl ({statusCounts.shortlisted})
          </TabsTrigger>
          <TabsTrigger value="interview">
            Interview ({statusCounts.interview})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Angenommen ({statusCounts.accepted})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Abgelehnt ({statusCounts.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStatus === "all" ? "Alle Bewerber" : `${getStatusText(selectedStatus)} Bewerber`}
              </CardTitle>
              <CardDescription>
                Verwalten Sie die Bewerber für diesen Suchauftrag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Erfahrung</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bewertung</TableHead>
                    <TableHead>Standort</TableHead>
                    <TableHead>Gehalt</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{applicant.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Beworben am: {new Date(applicant.appliedAt).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{applicant.email}</div>
                          {applicant.phone && (
                            <div className="text-muted-foreground">{applicant.phone}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{applicant.experience}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {applicant.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {applicant.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{applicant.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(applicant.status)}>
                          {getStatusText(applicant.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {renderStars(applicant.rating)}
                      </TableCell>
                      <TableCell>{applicant.location}</TableCell>
                      <TableCell>{applicant.expectedSalary}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => navigate(`/app/specialists/${applicant.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          {applicant.cvUrl && (
                            <Button variant="outline" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {applicant.status !== "accepted" && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateApplicantStatus(applicant.id, "accepted")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {applicant.status !== "rejected" && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => updateApplicantStatus(applicant.id, "rejected")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicantManagement;