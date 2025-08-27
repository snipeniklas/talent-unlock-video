import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Euro, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Candidate {
  id: string;
  headline: string;
  bio: string;
  primary_role: string;
  seniority: string;
  years_experience: number;
  rate_hourly_target: number;
  currency: string;
  skills: Array<{
    name: string;
    level?: string;
  }> | string[];
  candidate_identity: {
    first_name: string;
    last_name: string;
    country: string;
    city: string;
    avatar_url: string;
  } | null;
}

interface Allocation {
  id: string;
  candidate_id: string;
  status: string;
  client_status: string;
  notes: string;
  client_feedback: string;
  allocated_at: string;
  updated_at: string;
  candidates: Candidate;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  count: number;
  candidates: Allocation[];
}

const statusConfig = {
  proposed: { title: "Vorgeschlagen", color: "bg-blue-500" },
  reviewed: { title: "Geprüft", color: "bg-yellow-500" },
  interested: { title: "Interessant", color: "bg-green-500" },
  not_interested: { title: "Nicht interessant", color: "bg-gray-500" },
  interview_scheduled: { title: "Interview geplant", color: "bg-purple-500" },
  hired: { title: "Eingestellt", color: "bg-emerald-500" },
  rejected: { title: "Abgelehnt", color: "bg-red-500" },
};

const CandidateKanbanBoard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchRequest, setSearchRequest] = useState<any>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      // Get user authentication and company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

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
        return;
      }

      // Fetch search request details
      const { data: requestData, error: requestError } = await supabase
        .from('search_requests')
        .select('*')
        .eq('id', id)
        .eq('company_id', profile.company_id)
        .single();

      if (requestError || !requestData) {
        toast({
          title: "Fehler",
          description: "Suchauftrag nicht gefunden.",
          variant: "destructive",
        });
        navigate('/app/search-requests');
        return;
      }

      setSearchRequest(requestData);

      // Fetch allocations with candidate details
      const { data: allocationsData, error: allocError } = await supabase
        .from('search_request_allocations')
        .select('*')
        .eq('search_request_id', id);

      if (allocError) throw allocError;

      // Get candidate details for each allocation
      const allocationsWithCandidates = [];
      if (allocationsData && allocationsData.length > 0) {
        for (const allocation of allocationsData) {
          const { data: candidateData } = await supabase
            .from('candidates')
            .select(`
              *,
              candidate_identity (*)
            `)
            .eq('id', allocation.candidate_id)
            .single();
          
          allocationsWithCandidates.push({
            ...allocation,
            candidates: candidateData
          });
        }
      }
      
      setAllocations(allocationsWithCandidates);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Fehler",
        description: "Daten konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateStatus = async (allocationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('search_request_allocations')
        .update({ client_status: newStatus })
        .eq('id', allocationId);

      if (error) throw error;

      // Update local state
      setAllocations(prev => 
        prev.map(allocation => 
          allocation.id === allocationId 
            ? { ...allocation, client_status: newStatus }
            : allocation
        )
      );

      toast({
        title: "Status aktualisiert",
        description: "Der Kandidatenstatus wurde erfolgreich geändert.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, allocationId: string) => {
    setDraggedItem(allocationId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', allocationId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over state if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const allocationId = e.dataTransfer.getData('text/plain');
    
    if (allocationId && draggedItem === allocationId) {
      const allocation = allocations.find(a => a.id === allocationId);
      if (allocation && allocation.client_status !== newStatus) {
        await updateCandidateStatus(allocationId, newStatus);
      }
    }
    
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSkillName = (skill: any) => {
    return typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill';
  };

  const prepareKanbanData = (): KanbanColumn[] => {
    return Object.entries(statusConfig).map(([status, config]) => ({
      id: status,
      title: config.title,
      status: status,
      count: allocations.filter(a => a.client_status === status).length,
      candidates: allocations.filter(a => a.client_status === status)
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const kanbanColumns = prepareKanbanData();

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
          <h1 className="text-3xl font-bold">Kandidaten verwalten</h1>
          <p className="text-muted-foreground">{searchRequest?.title}</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {kanbanColumns.map((column) => (
          <Card 
            key={column.id} 
            className={`flex-shrink-0 w-80 h-fit transition-colors ${
              dragOverColumn === column.status ? 'bg-blue-50 border-blue-300' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${statusConfig[column.status as keyof typeof statusConfig].color}`}
                  />
                  {column.title}
                </div>
                <Badge variant="secondary">{column.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[200px]">
              {column.candidates.map((allocation) => {
                const candidate = allocation.candidates;
                const identity = candidate?.candidate_identity;
                const isDragging = draggedItem === allocation.id;
                
                return (
                  <Card 
                    key={allocation.id} 
                    className={`p-4 transition-all cursor-move ${
                      isDragging ? 'opacity-50 rotate-3 scale-105' : 'hover:shadow-md'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, allocation.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="space-y-3">
                      {/* Candidate Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={identity?.avatar_url} />
                          <AvatarFallback>
                            {identity ? getInitials(identity.first_name, identity.last_name) : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {identity ? `${identity.first_name} ${identity.last_name}` : 'Unbekannt'}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">
                            {candidate?.primary_role || 'Keine Rolle angegeben'}
                          </p>
                        </div>
                      </div>

                      {/* Candidate Details */}
                      <div className="space-y-2 text-sm">
                        {identity && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{identity.city}, {identity.country}</span>
                          </div>
                        )}
                        
                        {candidate?.rate_hourly_target && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Euro className="h-3 w-3" />
                            <span>€{candidate.rate_hourly_target}/h</span>
                          </div>
                        )}

                        {candidate?.years_experience && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Star className="h-3 w-3" />
                            <span>{candidate.years_experience} Jahre Erfahrung</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {candidate?.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((skill: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {getSkillName(skill)}
                            </Badge>
                          ))}
                          {candidate.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-7"
                          onClick={() => navigate(`/app/candidate/${candidate.id}`)}
                        >
                          Details anzeigen
                        </Button>
                        
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(statusConfig).map(([status, config]) => {
                            if (status === allocation.client_status) return null;
                            
                            return (
                              <Button
                                key={status}
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 flex-1"
                                onClick={() => updateCandidateStatus(allocation.id, status)}
                              >
                                {config.title}
                              </Button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Notes */}
                      {allocation.notes && (
                        <div className="bg-muted p-2 rounded text-xs">
                          <strong>Notizen:</strong> {allocation.notes}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
              
              {column.candidates.length === 0 && (
                <div className={`text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg transition-colors ${
                  dragOverColumn === column.status ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200'
                }`}>
                  {dragOverColumn === column.status ? 'Hier ablegen' : 'Keine Kandidaten in diesem Status'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CandidateKanbanBoard;