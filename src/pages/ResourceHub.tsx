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

          {/* Premium Software Demo Area - Asana Inspired */}
          <div className="relative min-h-[700px] bg-gradient-subtle rounded-3xl p-8 mb-16 overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-40 h-40 bg-primary rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse delay-500"></div>
            </div>

            {/* Main Dashboard Interface */}
            <Card 
              className="absolute top-8 left-8 w-96 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-30"
              onMouseEnter={() => setHoveredCard('dashboard')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-lg">RaaS Dashboard</h4>
                  <Badge className="bg-green-100 text-green-700">Live</Badge>
                </div>
                
                {/* Mock Dashboard Interface */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Aktive Projekte</span>
                    <span className="text-xs text-muted-foreground">12 von 15</span>
                  </div>
                  <div className="space-y-2">
                    {/* Project List Mock */}
                    <div className="flex items-center gap-3 p-2 bg-white rounded">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm flex-1">KI-Entwicklung Projekt</span>
                      <Badge variant="secondary" className="text-xs">Python</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm flex-1">Backoffice Automation</span>
                      <Badge variant="secondary" className="text-xs">Excel</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm flex-1">Mobile App Development</span>
                      <Badge variant="secondary" className="text-xs">React</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">98%</div>
                    <div className="text-xs text-muted-foreground">Erfolgsrate</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">2.1d</div>
                    <div className="text-xs text-muted-foreground">Ø Match-Zeit</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Talent Management Interface */}
            <Card 
              className="absolute top-12 right-8 w-80 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-30"
              onMouseEnter={() => setHoveredCard('talent')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Talent Pool</h4>
                    <p className="text-sm text-muted-foreground">479 verfügbare Experten</p>
                  </div>
                </div>
                
                {/* Mock Talent Interface */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Python, AI, Machine Learning</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2 bg-white rounded">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Code className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Max M.</div>
                        <div className="text-xs text-muted-foreground">Senior AI Engineer</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">5.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-white rounded">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Brain className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Sarah K.</div>
                        <div className="text-xs text-muted-foreground">ML Specialist</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button size="sm" className="w-full bg-gradient-primary border-0">
                  Alle Talente ansehen
                </Button>
              </CardContent>
            </Card>

            {/* Search Request Creation Interface */}
            <Card 
              className="absolute bottom-16 left-12 w-72 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-25"
              onMouseEnter={() => setHoveredCard('search')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Neue RaaS Anfrage</h4>
                    <p className="text-sm text-muted-foreground">Intelligente Suche</p>
                  </div>
                </div>
                
                {/* Mock Search Form */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Gesuchte Rolle</div>
                    <div className="bg-white rounded p-2 text-sm">Senior React Developer</div>
                    
                    <div className="text-xs text-muted-foreground">Skills</div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">React</Badge>
                      <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                      <Badge variant="secondary" className="text-xs">Node.js</Badge>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">Verfügbarkeit</div>
                    <div className="bg-white rounded p-2 text-sm">Vollzeit, remote</div>
                  </div>
                </div>
                
                <Button size="sm" className="w-full bg-gradient-primary border-0">
                  <Target className="w-3 h-3 mr-1" />
                  Suche starten
                </Button>
              </CardContent>
            </Card>

            {/* Analytics & Performance Interface */}
            <Card 
              className="absolute bottom-20 right-12 w-80 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-25"
              onMouseEnter={() => setHoveredCard('analytics')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Performance Analytics</h4>
                    <p className="text-sm text-muted-foreground">Letzte 30 Tage</p>
                  </div>
                </div>
                
                {/* Mock Analytics Interface */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Erfolgreiche Matches</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div className="w-14 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm font-bold text-green-600">87%</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ø Besetzungszeit</span>
                      <span className="text-sm font-bold">2.3 Tage</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Kundenzufriedenheit</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold">4.9</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">+15% vs. Vormonat</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button size="sm" variant="outline" className="w-full">
                  Detailbericht anzeigen
                </Button>
              </CardContent>
            </Card>

            {/* Security & Compliance Interface */}
            <Card 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20 w-84 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-35"
              onMouseEnter={() => setHoveredCard('security')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Sicherheit & Compliance</h4>
                    <p className="text-sm text-muted-foreground">Enterprise Standards</p>
                  </div>
                </div>
                
                {/* Mock Security Dashboard */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white rounded p-2 text-center">
                      <Lock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <div className="text-xs font-medium">DSGVO</div>
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <Globe className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <div className="text-xs font-medium">ISO 27001</div>
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                    </div>
                    <div className="bg-white rounded p-2 text-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <div className="text-xs font-medium">SOC 2</div>
                      <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Datenverschlüsselung</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>2FA Authentifizierung</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Audit Logs</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-gradient-primary border-0">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Zugang erhalten
                  </Button>
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Floating Main CTA */}
            <Button 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-primary border-0 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 px-10 py-6 text-lg"
              onClick={() => navigate('/auth')}
            >
              <UserCheck className="w-5 h-5 mr-2" />
              RaaS Hub jetzt öffnen
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