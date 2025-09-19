import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Search, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Building2, 
  UserCheck,
  Plus,
  FileText,
  Shield,
  MessageCircle,
  UserCog,
  Mail
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
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';
import { useTranslation } from '@/i18n/i18n';
import { useUserRole } from '@/hooks/useUserData';

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userRole = useUserRole();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: t('app.sidebar.logout.errorTitle', 'Fehler beim Abmelden'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/');
      toast({
        title: t('app.sidebar.logout.successTitle', 'Erfolgreich abgemeldet'),
        description: t('app.sidebar.logout.successDesc', 'Sie wurden erfolgreich abgemeldet.'),
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
    { title: t('app.sidebar.company.dashboard', 'Dashboard'), url: "/app/dashboard", icon: Home },
    { title: t('app.sidebar.company.requests', 'Suchaufträge'), url: "/app/search-requests", icon: Search },
    { title: t('app.sidebar.company.specialists', 'Spezialisten'), url: "/app/specialists", icon: Users },
    { title: t('app.sidebar.company.support', 'Support Chat'), url: "/app/support", icon: MessageCircle },
    { title: t('app.sidebar.company.settings', 'Einstellungen'), url: "/app/settings", icon: SettingsIcon },
  ];

  // Admin Navigation Items
  const adminItems = [
    { title: t('app.sidebar.admin.dashboard', 'Admin Dashboard'), url: "/admin/dashboard", icon: Shield },
    { title: t('app.sidebar.admin.companies', 'Alle Unternehmen'), url: "/admin/companies", icon: Building2 },
    { title: t('app.sidebar.admin.resources', 'RaaS Ressourcen'), url: "/admin/candidates", icon: UserCog },
    { title: t('app.sidebar.admin.projects', 'Kundenprojekte'), url: "/admin/search-requests", icon: FileText },
    { title: t('app.sidebar.admin.support', 'Support Chat'), url: "/admin/support", icon: MessageCircle },
    { title: t('app.sidebar.admin.settings', 'Benutzerverwaltung'), url: "/admin/settings", icon: SettingsIcon },
  ];

  // CRM Navigation Items
  const crmItems = [
    { title: t('crm.overview.title', 'CRM Übersicht'), url: "/admin/crm", icon: Shield },
    { title: t('crm.companies.title', 'Unternehmen'), url: "/admin/crm/companies", icon: Building2 },
    { title: t('crm.contacts.title', 'Kontakte'), url: "/admin/crm/contacts", icon: Users },
    { title: t('outreach.profile.title', 'Outreach Profil'), url: "/admin/outreach-profile", icon: Mail },
  ];

  if (!userRole) {
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

  const navigationItems = userRole === 'admin' ? adminItems : companyItems;

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"}>
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        {/* Logo Section */}
        {!isCollapsed && (
          <div className="flex items-center justify-center p-4 border-b bg-card">
            <img 
              src={hejTalentLogo} 
              alt="Hej Talent"
              className="h-8 hover:scale-105 transition-transform duration-300" 
            />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground font-semibold">
            {userRole === 'admin' ? t('app.sidebar.section.admin', 'Admin Bereich') : t('app.sidebar.section.main', 'Hauptmenü')}
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

        {/* CRM Section - Only for Admins */}
        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-foreground font-semibold">
              {t('crm.title', 'CRM System')}
            </SidebarGroupLabel>
            
            <SidebarGroupContent>
              <SidebarMenu>
                {crmItems.map((item) => (
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
        )}

        {/* Quick Actions */}
        {userRole !== 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-foreground font-semibold">{t('app.sidebar.quick', 'Schnellzugriff')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/app/search-requests/new" 
                      className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${getNavCls({ isActive })}`}
                    >
                      <Plus className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span className="flex-1">{t('app.sidebar.quick.new', 'Neue Anfrage')}</span>}
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
            {!isCollapsed && <span className="ml-2">{t('app.sidebar.logout.label', 'Abmelden')}</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}