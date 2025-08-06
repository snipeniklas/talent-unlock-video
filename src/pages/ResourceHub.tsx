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
              <span className="text-primary">RaaS Hub</span> - Ihre Service-Zentrale
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Verwalten Sie Ihre Remote-Services, Projekte und Deliverables in einer intelligenten Plattform
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

          {/* Service Overview Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
                Ihre RaaS Services im Überblick
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Verwalten Sie alle Ihre Remote-Services zentral - von der Anfrage bis zur Delivery
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
              {/* Service Dashboard Mock */}
              <div className="order-2 lg:order-1">
                <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">Service Dashboard</h4>
                      <Badge className="bg-green-100 text-green-700">12 Aktive Services</Badge>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">KI-Datenanalyse Service</div>
                          <div className="text-sm text-muted-foreground">Vollzeit • 2 Data Scientists</div>
                        </div>
                        <Badge variant="secondary">In Progress</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Cloud Migration Service</div>
                          <div className="text-sm text-muted-foreground">Projekt • 3 DevOps Engineers</div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Delivered</Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Buchhaltungs-Automation</div>
                          <div className="text-sm text-muted-foreground">Teilzeit • 1 Backoffice Expert</div>
                        </div>
                        <Badge variant="outline">Starting</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">€47k</div>
                        <div className="text-xs text-muted-foreground">Monatl. Services</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">98%</div>
                        <div className="text-xs text-muted-foreground">SLA Erfüllung</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">24h</div>
                        <div className="text-xs text-muted-foreground">Avg. Response</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Explanation */}
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">Service-Management leicht gemacht</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Behalten Sie den Überblick über alle Ihre Remote-Services. Von KI-Projekten bis hin zu 
                  Backoffice-Automation - alles zentral verwaltet mit Echtzeit-Status und Performance-Metriken.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Service-Portfolio Übersicht</div>
                      <div className="text-sm text-muted-foreground">Alle laufenden Services auf einen Blick</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Echtzeit Performance</div>
                      <div className="text-sm text-muted-foreground">SLA-Tracking und Delivery-Status</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Kosten-Transparenz</div>
                      <div className="text-sm text-muted-foreground">Klare Aufschlüsselung aller Service-Kosten</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Request Section */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Explanation */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">Neue RaaS Services anfragen</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Beschreiben Sie Ihr Business-Problem und erhalten Sie maßgeschneiderte Service-Lösungen. 
                  Unser KI-System matched Sie automatisch mit den passenden Experten-Teams.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Problem-zu-Lösung Matching</div>
                      <div className="text-sm text-muted-foreground">KI-gestützte Service-Empfehlungen</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Schnelle Service-Aktivierung</div>
                      <div className="text-sm text-muted-foreground">Services starten binnen 48h</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Garantierte Qualität</div>
                      <div className="text-sm text-muted-foreground">SLA-backed Service Delivery</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Service Request Mock */}
              <div>
                <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Neue Service-Anfrage</h4>
                        <p className="text-sm text-muted-foreground">Problem beschreiben</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Was möchten Sie erreichen?</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                          Automatisierung unserer Rechnungsverarbeitung mit KI-basierter Datenextraktion
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Gewünschter Service-Typ</label>
                        <div className="mt-1 flex gap-2">
                          <Badge className="bg-blue-100 text-blue-700">Backoffice Automation</Badge>
                          <Badge variant="outline">KI/ML</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Timeline & Budget</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                          Start: Innerhalb 2 Wochen • Budget: €15-25k/Monat
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <Brain className="w-4 h-4" />
                          <span className="text-sm font-medium">KI-Empfehlung</span>
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          3 passende Experten-Teams gefunden • Geschätzte Implementierung: 4-6 Wochen
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-primary border-0">
                        Service-Match starten
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Analytics & ROI Section */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Analytics Mock */}
              <div>
                <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Service Performance & ROI</h4>
                        <p className="text-sm text-muted-foreground">Letzte 90 Tage</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">312%</div>
                        <div className="text-sm text-muted-foreground">ROI Steigerung</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">-67%</div>
                        <div className="text-sm text-muted-foreground">Kosteneinsparung</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Service Delivery Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-green-100 rounded-full">
                            <div className="w-15 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-bold text-green-600">97%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ø Problem-zu-Lösung Zeit</span>
                        <span className="text-sm font-bold">3.2 Tage</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Service-Qualität Score</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">4.8/5</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-blue-700">Top Service-Impact</div>
                          <div className="text-xs text-blue-600">Backoffice Automation: 45% Effizienzsteigerung</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Explanation */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">Messbare Business-Erfolge</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Verfolgen Sie den ROI Ihrer RaaS Services mit detaillierten Performance-Metriken. 
                  Sehen Sie, wie Remote-Services Ihr Business transformieren.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">ROI-Tracking</div>
                      <div className="text-sm text-muted-foreground">Messbare Kosteneinsparungen und Effizienzsteigerungen</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Performance Analytics</div>
                      <div className="text-sm text-muted-foreground">Detaillierte Service-Leistungsbewertungen</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Business Impact</div>
                      <div className="text-sm text-muted-foreground">Konkrete Verbesserungen Ihrer Geschäftsprozesse</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Security Section */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Explanation */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">Enterprise-Grade Service Security</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Ihre sensiblen Business-Daten sind bei unseren RaaS Services in sichersten Händen. 
                  Vollständige Compliance und höchste Sicherheitsstandards.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Datensicherheit</div>
                      <div className="text-sm text-muted-foreground">End-to-End Verschlüsselung aller Service-Daten</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Compliance & Zertifizierung</div>
                      <div className="text-sm text-muted-foreground">ISO 27001, DSGVO, SOC 2 Type II</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Service Continuity</div>
                      <div className="text-sm text-muted-foreground">99.9% Uptime SLA für kritische Services</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security Mock */}
              <div>
                <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Security & Compliance Status</h4>
                        <p className="text-sm text-muted-foreground">Alle Services überwacht</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <Lock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-xs font-medium">DSGVO</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <Globe className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-xs font-medium">ISO 27001</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-xs font-medium">SOC 2</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Service-Datenverschlüsselung</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Multi-Factor Authentication</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Audit Logs & Monitoring</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Service SLA Monitoring</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">Service Uptime</div>
                      <div className="text-2xl font-bold text-blue-600">99.97%</div>
                      <div className="text-xs text-blue-600">Letzte 12 Monate</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main CTA */}
          <div className="text-center">
            <Button 
              size="lg" 
              className="text-xl px-12 py-8 bg-gradient-primary border-0 hover:scale-105 transition-transform shadow-2xl"
              onClick={() => navigate('/auth')}
            >
              <UserCheck className="w-6 h-6 mr-3" />
              RaaS Hub jetzt öffnen
              <ArrowRight className="w-6 h-6 ml-3" />
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