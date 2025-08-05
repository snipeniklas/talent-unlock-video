import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Search, 
  Users, 
  Settings, 
  LogOut, 
  Building2, 
  UserCheck,
  Plus,
  FileText,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heyTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

interface UserRole {
  role: 'admin' | 'company_admin' | 'user';
}

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roles) {
          setUserRole({ role: roles.role });
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUserRole();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Fehler beim Abmelden",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
    }
  };

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-white font-medium" 
      : "text-foreground hover:bg-muted/50 hover:text-foreground";

  // Company Admin/User Navigation Items
  const companyItems = [
    { title: "Dashboard", url: "/app/dashboard", icon: Home },
    { title: "Suchaufträge", url: "/app/search-requests", icon: Search },
    { title: "Spezialisten", url: "/app/specialists", icon: Users },
    { title: "Einstellungen", url: "/app/settings", icon: Settings },
  ];

  // Admin Navigation Items
  const adminItems = [
    { title: "Admin Dashboard", url: "/admin/dashboard", icon: Shield },
    { title: "Alle Unternehmen", url: "/admin/companies", icon: Building2 },
    { title: "RaaS Ressourcen", url: "/admin/resources", icon: UserCheck },
    { title: "Kundenprojekte", url: "/admin/search-requests", icon: FileText },
    { title: "Benutzerverwaltung", url: "/admin/settings", icon: Settings },
  ];

  if (loading) {
    return (
    <Sidebar className={`${isCollapsed ? "w-14" : "w-60"} bg-card border-r`}>
        <SidebarContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const navigationItems = userRole?.role === 'admin' ? adminItems : companyItems;
  const isExpanded = navigationItems.some((item) => isActive(item.url));

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        {/* Logo Section */}
        {!isCollapsed && (
          <div className="flex items-center justify-center p-4 border-b bg-card">
            <img 
              src={heyTalentLogo} 
              alt="HeyTalent" 
              className="h-8 hover:scale-105 transition-transform duration-300" 
            />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground font-semibold">
            {userRole?.role === 'admin' ? 'Admin Bereich' : 'Hauptmenü'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavCls({ isActive })}`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="flex-1">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {userRole?.role !== 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-foreground font-semibold">Schnellzugriff</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/app/search-requests/new" 
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavCls({ isActive })}`}
                    >
                      <Plus className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="flex-1">Neue Anfrage</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Logout Section */}
        <div className="mt-auto p-4 border-t bg-card">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2">Abmelden</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}