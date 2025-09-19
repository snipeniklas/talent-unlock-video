import { useQuery } from '@tanstack/react-query';
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
  return useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Fetch user profile with company and roles - optimized query
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          company_id,
          first_name,
          last_name,
          email,
          phone,
          companies:company_id(
            id,
            name,
            email,
            website
          ),
          user_roles(role)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.warn('Profile loading error:', profileError);
        throw new Error('Benutzerprofil konnte nicht geladen werden');
      }

      return {
        user,
        profile: profile as any // Safe type assertion after successful query
      };
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