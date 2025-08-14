import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: string;
  primary_role: string;
  seniority: 'junior' | 'mid' | 'senior' | 'lead';
  years_experience: number;
  headline: string;
  availability: 'immediately' | 'notice_period' | 'booked' | 'paused';
  rate_hourly_target: number;
  rate_monthly_target: number;
  currency: string;
  created_at: string;
  candidate_identity?: {
    first_name: string;
    last_name: string;
    country: string;
    city: string;
  };
}

export default function CandidateManagement() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
        const { data, error } = await supabase
          .from('candidates')
          .select(`
            *,
            candidate_identity (
              first_name,
              last_name,
              country,
              city
            ),
            candidate_experience (
              title,
              org_name,
              start_date,
              end_date
            )
          `)
          .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: "Fehler",
        description: "RaaS Ressourcen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const fullName = candidate.candidate_identity 
      ? `${candidate.candidate_identity.first_name} ${candidate.candidate_identity.last_name}`
      : '';
    const searchString = `${fullName} ${candidate.primary_role} ${candidate.headline}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'junior': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-green-100 text-green-800';
      case 'senior': return 'bg-orange-100 text-orange-800';
      case 'lead': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'immediately': return 'bg-green-100 text-green-800';
      case 'notice_period': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">RaaS Ressourcen-Management</h1>
        </div>
        <Button 
          onClick={() => navigate('/admin/candidates/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neue RaaS Ressource anlegen
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="RaaS Ressourcen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine RaaS Ressourcen gefunden</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Keine RaaS Ressourcen entsprechen Ihrer Suche.' : 'Noch keine RaaS Ressourcen angelegt.'}
            </p>
            <Button onClick={() => navigate('/admin/candidates/new')}>
              Erste RaaS Ressource anlegen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {candidate.candidate_identity 
                          ? `${candidate.candidate_identity.first_name} ${candidate.candidate_identity.last_name}`
                          : 'Unbenannt'
                        }
                      </h3>
                      <Badge className={getSeniorityColor(candidate.seniority)}>
                        {candidate.seniority}
                      </Badge>
                      <Badge className={getAvailabilityColor(candidate.availability)}>
                        {candidate.availability === 'immediately' ? 'Sofort verfügbar' : 
                         candidate.availability === 'notice_period' ? 'Kündigungsfrist' :
                         candidate.availability === 'booked' ? 'Gebucht' : 'Pausiert'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">{candidate.primary_role}</p>
                    {candidate.headline && (
                      <p className="text-sm text-gray-700 mb-2">{candidate.headline}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {candidate.years_experience && (
                        <span>{candidate.years_experience} Jahre Erfahrung</span>
                      )}
                      {candidate.rate_monthly_target && (
                        <span>{candidate.rate_monthly_target} {candidate.currency}/Monat ({(candidate.rate_monthly_target / 160).toFixed(0)} {candidate.currency}/Std.)</span>
                      )}
                      {candidate.candidate_identity?.city && (
                        <span>{candidate.candidate_identity.city}, {candidate.candidate_identity.country}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}