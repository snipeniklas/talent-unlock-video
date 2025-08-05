import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Eye, Mail, Phone, MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  current_position?: string;
  experience_years?: number;
  skills?: string[];
  languages?: string[];
  availability?: string;
  salary_expectation_min?: number;
  salary_expectation_max?: number;
  rating?: number;
  status: string;
  created_at: string;
}

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.current_position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      available: "default",
      interviewing: "secondary", 
      placed: "outline",
      unavailable: "destructive"
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getAvailabilityText = (availability?: string) => {
    const texts = {
      immediate: "Sofort verfügbar",
      "2_weeks": "In 2 Wochen",
      "1_month": "In 1 Monat", 
      "3_months": "In 3 Monaten"
    };
    return availability ? texts[availability as keyof typeof texts] : "Nicht angegeben";
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground">Nicht bewertet</span>;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bewerberverwaltung</h1>
          <p className="text-muted-foreground">Alle Bewerberprofile verwalten</p>
        </div>
        <Button onClick={() => navigate('/admin/candidates/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Neuen Bewerber anlegen
        </Button>
      </div>

      {/* Filter und Suche */}
      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name, E-Mail, Position oder Skills suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="available">Verfügbar</SelectItem>
                <SelectItem value="interviewing">Im Gespräch</SelectItem>
                <SelectItem value="placed">Vermittelt</SelectItem>
                <SelectItem value="unavailable">Nicht verfügbar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kandidaten Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Bewerber ({filteredCandidates.length})</CardTitle>
          <CardDescription>
            Verwalten Sie alle Bewerberprofile und deren Informationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Keine Bewerber gefunden, die den Filterkriterien entsprechen."
                  : "Noch keine Bewerber angelegt."
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button 
                  onClick={() => navigate('/admin/candidates/new')} 
                  className="mt-4"
                >
                  Ersten Bewerber anlegen
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Erfahrung</TableHead>
                    <TableHead>Verfügbarkeit</TableHead>
                    <TableHead>Bewertung</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{candidate.first_name} {candidate.last_name}</p>
                          {candidate.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {candidate.location}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {candidate.email}
                          </p>
                          {candidate.phone && (
                            <p className="text-sm flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {candidate.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{candidate.current_position || "Nicht angegeben"}</p>
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {candidate.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {candidate.experience_years ? `${candidate.experience_years} Jahre` : "Nicht angegeben"}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{getAvailabilityText(candidate.availability)}</p>
                        {candidate.salary_expectation_min && candidate.salary_expectation_max && (
                          <p className="text-xs text-muted-foreground">
                            €{candidate.salary_expectation_min.toLocaleString()} - €{candidate.salary_expectation_max.toLocaleString()}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {renderStars(candidate.rating)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(candidate.status) as any}>
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate(`/admin/candidates/${candidate.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}