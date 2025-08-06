import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Users, 
  FileText, 
  BarChart, 
  Settings, 
  Lock, 
  Shield, 
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Target,
  Globe,
  Rocket,
  Database,
  Activity,
  Brain,
  Code,
  LineChart,
  UserCheck,
  Search,
  Bell
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";

const ResourceHub = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      {/* Hero Section with Floating Elements */}
      <section className="relative py-12 md:py-20 lg:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              <span className="text-primary">RaaS Hub</span> - Ihr intelligentes Dashboard
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Der zentrale Ort für alle Ihre Remote-Ressourcen, Projekte und Erfolgsmetriken
            </p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
                ✨ Echtzeit-Updates
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2">
                🔒 DSGVO-konform
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-4 py-2">
                📊 Advanced Analytics
              </Badge>
            </div>
          </div>

          {/* Premium Floating Demo Area */}
          <div className="relative min-h-[700px] bg-gradient-subtle rounded-3xl p-8 mb-16 overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-40 h-40 bg-primary rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
              <div className="absolute top-20 right-20 w-24 h-24 bg-green-500 rounded-full blur-2xl animate-pulse delay-1500"></div>
            </div>

            {/* Central Command Center */}
            <Card 
              className="absolute top-8 left-1/2 transform -translate-x-1/2 w-96 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-40"
              onMouseEnter={() => setHoveredCard('command')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-xl">Command Center</h4>
                  <Badge className="bg-primary text-white animate-pulse">Live</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-primary/10 rounded-lg p-3 text-center">
                    <Activity className="w-6 h-6 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-brand-dark">127</div>
                    <div className="text-xs text-muted-foreground">Aktive RaaS</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-600">98.7%</div>
                    <div className="text-xs text-muted-foreground">Erfolgsrate</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-blue-600">1.8d</div>
                    <div className="text-xs text-muted-foreground">Ø Match-Zeit</div>
                  </div>
                </div>

                <Button className="w-full bg-gradient-primary border-0 hover:scale-105 transition-transform">
                  <Rocket className="w-4 h-4 mr-2" />
                  Hub öffnen
                </Button>
              </CardContent>
            </Card>

            {/* AI Insights Panel */}
            <Card 
              className="absolute top-12 left-8 w-80 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-30"
              onMouseEnter={() => setHoveredCard('ai')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">KI-Insights</h4>
                    <p className="text-sm text-muted-foreground">Intelligente Empfehlungen</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-purple-700">Trend-Prognose</div>
                    <div className="text-xs text-purple-600">+23% AI/ML Nachfrage Q1 2025</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-700">Optimierung</div>
                    <div className="text-xs text-blue-600">3 neue Talente für Sie identifiziert</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Performance Dashboard */}
            <Card 
              className="absolute top-12 right-8 w-72 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-30"
              onMouseEnter={() => setHoveredCard('performance')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <LineChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Live Performance</h4>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600">Alle Systeme aktiv</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Projekt-Erfolgsrate</span>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-2 bg-green-100 rounded-full">
                        <div className="w-7 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">94%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Talent-Verfügbarkeit</span>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-2 bg-blue-100 rounded-full">
                        <div className="w-6 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-bold text-blue-600">87%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Pool Overview */}
            <Card 
              className="absolute bottom-16 left-12 w-64 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-25"
              onMouseEnter={() => setHoveredCard('pool')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Talent Pool</h4>
                    <p className="text-sm text-muted-foreground">Globales Netzwerk</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">Entwickler</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">234</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-green-500" />
                      <span className="text-sm">AI/ML Experten</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">89</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Backoffice</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">156</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Notifications */}
            <Card 
              className="absolute bottom-20 right-12 w-72 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-25"
              onMouseEnter={() => setHoveredCard('notifications')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Live Updates</h4>
                    <p className="text-sm text-muted-foreground">Neueste Aktivitäten</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Neuer Kandidat</p>
                      <p className="text-xs text-muted-foreground">Senior React Dev verfügbar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Projekt Update</p>
                      <p className="text-xs text-muted-foreground">KI-Projekt 87% abgeschlossen</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Intelligence */}
            <Card 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20 w-80 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-35"
              onMouseEnter={() => setHoveredCard('search')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Intelligente Suche</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      KI-gestützte Talent-Matching für perfekte Results in Sekunden
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-primary border-0">
                        <Zap className="w-3 h-3 mr-1" />
                        Jetzt suchen
                      </Button>
                      <Button size="sm" variant="ghost">
                        Mehr erfahren
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Login CTA */}
            <Button 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-primary border-0 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 px-10 py-6 text-lg"
              onClick={() => navigate('/auth')}
            >
              <UserCheck className="w-5 h-5 mr-2" />
              Hub jetzt öffnen
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Feature Grid with Enhanced Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce shadow-lg">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  Intelligente Verwaltung
                </h3>
                <p className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                  KI-gestützte Automatisierung für mühelose Remote-Team Verwaltung
                </p>
              </CardContent>
            </Card>
            
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce shadow-lg">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  Enterprise Sicherheit
                </h3>
                <p className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                  Bank-level Sicherheit mit ISO 27001 Zertifizierung und DSGVO-Compliance
                </p>
              </CardContent>
            </Card>
            
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
              <CardContent className="p-8 relative z-10">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce shadow-lg">
                  <Globe className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                  Global verfügbar
                </h3>
                <p className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                  24/7 Support und weltweites Talent-Netzwerk für Ihren Erfolg
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Premium CTA Section */}
          <div className="bg-gradient-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark">
              Bereit für die Zukunft des Remote-Recruitings?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Treten Sie ein in die neue Ära intelligenter Talent-Beschaffung und erleben Sie,
              wie KI Ihr Recruiting revolutioniert.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-primary border-0 hover:scale-105 transition-transform" onClick={() => navigate('/auth')}>
                <UserCheck className="w-5 h-5 mr-2" />
                Hub jetzt öffnen
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300" onClick={() => navigate('/contact')}>
                Demo anfragen
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <ContactCTA />
      <PublicFooter />
    </div>
  );
};

export default ResourceHub;