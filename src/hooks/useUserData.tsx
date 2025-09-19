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

      // Fetch user profile with company and roles in one query
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          companies(*),
          user_roles(role)
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      return {
        user,
        profile: profile as any // Type assertion for complex nested query
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
    retry: 2,
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