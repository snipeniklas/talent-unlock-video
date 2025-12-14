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
  const { data: userData, isLoading: userLoading, isSuccess: userSuccess } = useUserData();
  const companyId = userData?.profile?.company_id;

  console.log('Dashboard Data Hook:', { 
    userLoading, 
    userSuccess, 
    companyId, 
    hasUserData: !!userData 
  });

  return useQuery({
    queryKey: ['dashboardData', companyId],
    queryFn: async () => {
      console.log('Dashboard query executing with companyId:', companyId);
      
      if (!companyId) {
        console.error('No company ID available for dashboard query');
        // Return empty data instead of throwing error
        return {
          stats: {
            activeSearchRequests: 0,
            completedProjects: 0,
            pendingRequests: 0,
            totalSpecialists: 0,
          },
          recentRequests: [],
          specialists: [],
        };
      }

      // First, get allocated candidate IDs for this company
      const { data: allocationsData } = await supabase
        .from('search_request_allocations')
        .select(`
          candidate_id,
          search_requests!inner(company_id)
        `)
        .eq('search_requests.company_id', companyId);

      const allocatedCandidateIds = allocationsData?.map(a => a.candidate_id) || [];

      // Parallel data fetching for better performance
      const [searchRequestsData, candidatesData, recentRequestsData, specialistsData] = await Promise.all([
        // Search requests for stats
        supabase
          .from('search_requests')
          .select('status')
          .eq('company_id', companyId),
        
        // Total candidates count (absolute, bypasses RLS)
        // @ts-ignore - RPC function not yet in generated types
        supabase.rpc('get_total_candidates_count'),
        
        // Recent search requests (limit 3)
        supabase
          .from('search_requests')
          .select('id, title, status, created_at')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Recommended specialists - only those allocated to this company's search requests
        allocatedCandidateIds.length > 0
          ? supabase
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
              .in('candidate_id', allocatedCandidateIds)
              .limit(3)
          : Promise.resolve({ data: [], error: null })
      ]);

      // Calculate stats
      const searchRequests = searchRequestsData.data || [];
      console.log('Search requests data:', searchRequests);
      
      const stats: DashboardStats = {
        activeSearchRequests: searchRequests.filter(r => r.status === 'active').length,
        completedProjects: searchRequests.filter(r => r.status === 'completed').length,
        pendingRequests: searchRequests.filter(r => r.status === 'pending').length,
        totalSpecialists: (candidatesData.data as unknown as number) || 0,
      };
      
      console.log('Calculated dashboard stats:', stats);

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

      const result = {
        stats,
        recentRequests,
        specialists,
      };
      
      console.log('Final dashboard data:', result);
      return result;
    },
    enabled: !!companyId && userSuccess && !userLoading,
    staleTime: 1000 * 60, // 60 seconds - less aggressive refetching
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus during initial load
    retry: (failureCount, error) => {
      console.log('Dashboard query retry:', { failureCount, error: error.message });
      // Don't retry if company ID is missing
      return failureCount < 2 && !error.message.includes('No company ID');
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
};