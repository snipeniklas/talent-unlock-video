import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  user_id: string;
  company_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  companies: {
    id: string;
    name: string;
    email: string | null;
    website: string | null;
  } | null;
  user_roles: {
    role: 'admin' | 'company_admin' | 'user';
  }[];
}

export const useUserData = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // First get the basic profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.warn('Profile loading error:', profileError);
        throw new Error('Benutzerprofil konnte nicht geladen werden');
      }

      // Then get company data if company_id exists
      let companyData = null;
      if (profile.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profile.company_id)
          .maybeSingle();
        companyData = company;
      }

      // Then get user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      // Combine the data
      const combinedProfile = {
        ...profile,
        companies: companyData,
        user_roles: userRoles || []
      };

      const result = {
        user,
        profile: combinedProfile as any // Safe type assertion after successful query
      };
      
      console.log('User data loaded successfully:', result);
      
      return result;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Retry up to 2 times, but not for auth errors
      return failureCount < 2 && !error.message.includes('Not authenticated');
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useUserRole = () => {
  const { data } = useUserData();
  return data?.profile?.user_roles?.[0]?.role || null;
};

export const useUserCompany = () => {
  const { data } = useUserData();
  return data?.profile?.companies || null;
};