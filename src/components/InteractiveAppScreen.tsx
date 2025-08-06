import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  Building2, 
  Calendar, 
  Star, 
  ChevronRight,
  Eye,
  UserCheck,
  FileText,
  Settings,
  Bell,
  BarChart3,
  Clock,
  CheckCircle
} from "lucide-react";

interface InteractiveScreenProps {
  title: string;
  description: string;
  screen: "dashboard" | "search-requests" | "resources";
}

const InteractiveAppScreen: React.FC<InteractiveScreenProps> = ({ title, description, screen }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const mockSearchRequests = [
    {
      id: 1,
      title: "Remote AI Entwickler (Python)",
      company: "TechCorp GmbH",
      location: "Remote",
      status: "active",
      resources: 2,
      created: "vor 2 Tagen"
    },
    {
      id: 2,
      title: "Buchhaltungs-Ressource Teilzeit",
      company: "StartupTech",
      location: "Remote",
      status: "active", 
      resources: 1,
      created: "vor 1 Woche"
    },
    {
      id: 3,
      title: "Data Science Spezialist",
      company: "DataCorp",
      location: "Remote",
      status: "completed",
      resources: 1,
      created: "vor 2 Wochen"
    }
  ];

  const mockResources = [
    {
      id: 1,
      name: "Max Mustermann",
      position: "Senior AI Engineer",
      location: "Berlin",
      rating: 5,
      skills: ["Python", "TensorFlow", "AWS"],
      availability: "Sofort verfügbar",
      hourlyRate: "€45-65/h"
    },
    {
      id: 2,
      name: "Sarah Schmidt",
      position: "Buchhaltungsexpertin",
      location: "Hamburg", 
      rating: 4,
      skills: ["SAP", "DATEV", "Excel"],
      availability: "In 2 Wochen",
      hourlyRate: "€25-35/h"
    },
    {
      id: 3,
      name: "Dr. Anna Weber",
      position: "Data Scientist",
      location: "München",
      rating: 5,
      skills: ["R", "SQL", "Machine Learning"],
      availability: "In 1 Monat",
      hourlyRate: "€55-75/h"
    }
  ];

  const renderDashboard = () => (
    <div className="space-y-4">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Dashboard</h3>
          <p className="text-muted-foreground">Übersicht Ihrer RaaS-Aktivitäten</p>
        </div>
        <Button size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Ressource anfragen
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">3</div>
          <div className="text-xs text-muted-foreground">Aktive Projekte</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-green-600">8</div>
          <div className="text-xs text-muted-foreground">Zugeteilte Ressourcen</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">4</div>
          <div className="text-xs text-muted-foreground">Abgeschlossene Projekte</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">2</div>
          <div className="text-xs text-muted-foreground">Wartende Ressourcen</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Aktuelle Aktivitäten</h4>
        {[
          { icon: UserCheck, text: "Neue Ressource für AI-Entwickler Projekt zugewiesen", time: "vor 2h", color: "text-green-600" },
          { icon: FileText, text: "Ressourcenanfrage 'Data Science Spezialist' aktualisiert", time: "vor 4h", color: "text-blue-600" },
          { icon: CheckCircle, text: "Projekt 'Buchhaltungs-Ressource' erfolgreich abgeschlossen", time: "vor 1d", color: "text-purple-600" }
        ].map((activity, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors ${hoveredItem === idx ? 'bg-muted/50' : ''}`}
            onMouseEnter={() => setHoveredItem(idx)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <activity.icon className={`w-4 h-4 ${activity.color}`} />
            <div className="flex-1">
              <div className="text-sm">{activity.text}</div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSearchRequests = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Suchaufträge</h3>
        <Button size="sm">
          <Search className="w-4 h-4 mr-2" />
          Neuen Auftrag erstellen
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {["all", "active", "completed"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="text-xs"
          >
            {tab === "all" ? "Alle" : tab === "active" ? "Aktiv" : "Abgeschlossen"}
          </Button>
        ))}
      </div>

      {/* Search Requests List */}
      <div className="space-y-2">
        {mockSearchRequests
          .filter(req => activeTab === "all" || req.status === activeTab)
          .map((request, idx) => (
            <div 
              key={request.id}
              className={`p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer ${hoveredItem === idx ? 'shadow-md border-primary/30' : ''}`}
              onMouseEnter={() => setHoveredItem(idx)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-sm">{request.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {request.company}
                  </div>
                </div>
                <Badge variant={request.status === "active" ? "default" : "outline"} className="text-xs">
                  {request.status === "active" ? "Aktiv" : "Abgeschlossen"}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{request.resources} Ressourcen</span>
                <span>{request.created}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Verfügbare Ressourcen</h3>
        <Button size="sm" variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Alle anzeigen
        </Button>
      </div>

      {/* Resources List */}
      <div className="space-y-3">
        {mockResources.map((resource, idx) => (
          <div 
            key={resource.id}
            className={`p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer ${hoveredItem === idx ? 'shadow-md border-primary/30' : ''}`}
            onMouseEnter={() => setHoveredItem(idx)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-sm">{resource.name}</div>
                <div className="text-xs text-muted-foreground">{resource.position}</div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(resource.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {resource.skills.slice(0, 3).map((skill, skillIdx) => (
                <Badge key={skillIdx} variant="secondary" className="text-xs px-2 py-0">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {resource.availability}
              </span>
              <span className="font-medium text-primary">{resource.hourlyRate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Admin Dashboard</h3>
        <Badge variant="destructive" className="text-xs">HejTalent Admin</Badge>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-red-600">156</div>
          <div className="text-xs text-muted-foreground">Registrierte Unternehmen</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">423</div>
          <div className="text-xs text-muted-foreground">Verfügbare Ressourcen</div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Verwaltung</h4>
        {[
          { icon: Users, text: "Benutzerverwaltung", count: "1,234", color: "text-blue-600" },
          { icon: Building2, text: "Unternehmen verwalten", count: "156", color: "text-green-600" },
          { icon: UserCheck, text: "Ressourcen zuweisen", count: "42", color: "text-purple-600" },
          { icon: BarChart3, text: "Analytics & Reports", count: "", color: "text-orange-600" }
        ].map((item, idx) => (
          <div 
            key={idx}
            className={`flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer ${hoveredItem === idx ? 'bg-muted/50' : ''}`}
            onMouseEnter={() => setHoveredItem(idx)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <item.icon className={`w-4 h-4 ${item.color}`} />
            <div className="flex-1 text-sm">{item.text}</div>
            {item.count && (
              <Badge variant="outline" className="text-xs">
                {item.count}
              </Badge>
            )}
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return renderDashboard();
      case "search-requests":
        return renderSearchRequests();
      case "resources":
        return renderResources();
      default:
        return renderDashboard();
    }
  };

  return (
    <Card className="h-full bg-white/95 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {renderScreen()}
      </CardContent>
    </Card>
  );
};

export default InteractiveAppScreen;