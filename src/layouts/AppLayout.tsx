import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useTranslation } from '@/i18n/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Create a client outside the component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear React Query cache on auth change
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
        
        // Redirect unauthenticated users
        if (!session?.user && !loading) {
          navigate('/auth');
        }
        
        if (loading) {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Redirect if not authenticated
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Global header with trigger */}
          <header className="fixed top-0 left-0 right-0 h-12 flex items-center border-b bg-background/95 backdrop-blur-sm z-40 px-4">
            <SidebarTrigger className="md:ml-2" />
            <div className="flex-1 text-center">
              <span className="font-semibold text-brand-dark text-sm md:text-base">{t('app.layout.title', 'Hej Talent Platform')}</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </header>

          <AppSidebar />

          <main className="flex-1 pt-12 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 max-w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
};

export default AppLayout;