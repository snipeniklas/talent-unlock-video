import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserData } from './useUserData';

export interface DashboardStats {
  activeSearchRequests: number;
  totalSpecialists: number;
  completedProjects: number;
  pendingRequests: number;
}

export interface RecentSearchRequest {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export interface RecommendedSpecialist {
  id: string;
  first_name: string | null;
  last_name: string | null;
  current_position: string | null;
  experience_years: number | null;
  rating: number | null;
}

export const useDashboardData = () => {
  const { data: userData, isLoading: userLoading } = useUserData();
  const companyId = userData?.profile?.company_id;

  return useQuery({
    queryKey: ['dashboardData', companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error('No company ID available');
      }

      // Parallel data fetching for better performance
      const [searchRequestsData, candidatesData, recentRequestsData, specialistsData] = await Promise.all([
        // Search requests for stats
        supabase
          .from('search_requests')
          .select('status')
          .eq('company_id', companyId),
        
        // Total candidates count
        supabase
          .from('candidates')
          .select('id', { count: 'exact', head: true }),
        
        // Recent search requests (limit 3)
        supabase
          .from('search_requests')
          .select('id, title, status, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Recommended specialists
        supabase
          .from('candidate_identity')
          .select(`
            candidate_id,
            first_name,
            last_name,
            candidates!inner(
              primary_role,
              years_experience
            )
          `)
          .limit(3)
      ]);

      // Calculate stats
      const searchRequests = searchRequestsData.data || [];
      const stats: DashboardStats = {
        activeSearchRequests: searchRequests.filter(r => r.status === 'active').length,
        completedProjects: searchRequests.filter(r => r.status === 'completed').length,
        pendingRequests: searchRequests.filter(r => r.status === 'pending').length,
        totalSpecialists: candidatesData.count || 0,
      };

      // Format recent requests
      const recentRequests: RecentSearchRequest[] = recentRequestsData.data || [];

      // Format recommended specialists
      const specialists: RecommendedSpecialist[] = (specialistsData.data || []).map(item => ({
        id: item.candidate_id,
        first_name: item.first_name,
        last_name: item.last_name,
        current_position: item.candidates?.primary_role || null,
        experience_years: item.candidates?.years_experience || null,
        rating: null // Rating would need to be added to the schema
      }));

      return {
        stats,
        recentRequests,
        specialists,
      };
    },
    enabled: !!companyId && !userLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes (renamed from cacheTime)
    retry: 2,
  });
};