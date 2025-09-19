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
      console.log('Search requests data:', searchRequests);
      
      const stats: DashboardStats = {
        activeSearchRequests: searchRequests.filter(r => r.status === 'active').length,
        completedProjects: searchRequests.filter(r => r.status === 'completed').length,
        pendingRequests: searchRequests.filter(r => r.status === 'pending').length,
        totalSpecialists: candidatesData.count || 0,
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
    staleTime: 1000 * 10, // 10 seconds - very short for immediate updates
    gcTime: 1000 * 60 * 1, // 1 minute - short cache
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: (failureCount, error) => {
      console.log('Dashboard query retry:', { failureCount, error: error.message });
      // Don't retry if company ID is missing
      return failureCount < 1 && !error.message.includes('No company ID');
    },
    retryDelay: 1000, // Quick retry
  });
};