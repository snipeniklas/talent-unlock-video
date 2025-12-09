import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useTranslation } from '@/i18n/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserData } from "@/hooks/useUserData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon, LogOut } from "lucide-react";

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
  const { data: userData } = useUserData();

  const getInitials = () => {
    const firstName = userData?.profile?.first_name;
    const lastName = userData?.profile?.last_name;
    
    if (!firstName && !lastName) return '?';
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return `${first}${last}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

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
              
              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
                    <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userData?.profile?.first_name} {userData?.profile?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    const role = userData?.profile?.user_roles?.[0]?.role;
                    const settingsPath = role === 'admin' ? '/admin/settings' : '/app/settings';
                    navigate(settingsPath);
                  }}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>{t('app.layout.profile', 'Profil')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('app.layout.logout', 'Abmelden')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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