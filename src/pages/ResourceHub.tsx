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
import { useTranslation } from '@/i18n/i18n';

const ResourceHub = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { t, get } = useTranslation();

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
              <span className="text-primary">{t('resourceHub.hero.title', 'RaaS Hub')}</span>{t('resourceHub.hero.titleSuffix', ' - Ihre Service-Zentrale')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('resourceHub.hero.subtitle', 'Verwalten Sie Ihre Remote-Services, Projekte und Deliverables in einer intelligenten Plattform')}
            </p>
            
            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {get<string[]>('resourceHub.hero.badges', ['✨ Echtzeit-Updates', '🔒 DSGVO-konform', '📊 Advanced Analytics']).map((b, i) => (
                <Badge key={i} className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
                  {b}
                </Badge>
              ))}
            </div>
          </div>

          {/* Service Overview Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
                {t('resourceHub.overview.title', 'Ihre RaaS Services im Überblick')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('resourceHub.overview.subtitle', 'Verwalten Sie alle Ihre Remote-Services zentral - von der Anfrage bis zur Delivery')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
              {/* Service Dashboard Mock */}
              <div className="order-2 lg:order-1">
                <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg">{t('resourceHub.dashboard.title', 'Service Dashboard')}</h4>
                      <Badge className="bg-green-100 text-green-700">{t('resourceHub.dashboard.active', '12 Aktive Services')}</Badge>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {get<Array<{title: string; desc: string; status: string}>>('resourceHub.dashboard.items', [
                        { title: 'KI-Datenanalyse Service', desc: 'Vollzeit • 2 Data Scientists', status: 'In Progress' },
                        { title: 'Cloud Migration Service', desc: 'Projekt • 3 DevOps Engineers', status: 'Delivered' },
                        { title: 'Buchhaltungs-Automation', desc: 'Teilzeit • 1 Backoffice Expert', status: 'Starting' }
                      ])?.map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 ${i===0?'bg-blue-50': i===1?'bg-green-50':'bg-orange-50'} rounded-lg`}>
                          <div className={`w-3 h-3 ${i===0?'bg-blue-500': i===1?'bg-green-500':'bg-orange-500'} rounded-full`}></div>
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.desc}</div>
                          </div>
                          <Badge variant={i===2? 'outline' : 'secondary'}>{item.status}</Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">€47k</div>
                        <div className="text-xs text-muted-foreground">{t('resourceHub.dashboard.kpis.mrr', 'Monatl. Services')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">98%</div>
                        <div className="text-xs text-muted-foreground">{t('resourceHub.dashboard.kpis.sla', 'SLA Erfüllung')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">24h</div>
                        <div className="text-xs text-muted-foreground">{t('resourceHub.dashboard.kpis.response', 'Avg. Response')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Explanation */}
              <div className="order-1 lg:order-2">
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">{t('resourceHub.management.title', 'Service-Management leicht gemacht')}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('resourceHub.management.text', 'Behalten Sie den Überblick über alle Ihre Remote-Services. Von KI-Projekten bis hin zu Backoffice-Automation - alles zentral verwaltet mit Echtzeit-Status und Performance-Metriken.')}
                </p>
                <div className="space-y-3">
                  {get<Array<{title: string; desc: string}>>('resourceHub.management.bullets', [
                    { title: 'Service-Portfolio Übersicht', desc: 'Alle laufenden Services auf einen Blick' },
                    { title: 'Echtzeit Performance', desc: 'SLA-Tracking und Delivery-Status' },
                    { title: 'Kosten-Transparenz', desc: 'Klare Aufschlüsselung aller Service-Kosten' }
                  ])?.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{b.title}</div>
                        <div className="text-sm text-muted-foreground">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Request Section */}
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Explanation */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">{t('resourceHub.request.title', 'Neue RaaS Services anfragen')}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('resourceHub.request.text', 'Beschreiben Sie Ihr Business-Problem und erhalten Sie maßgeschneiderte Service-Lösungen. Unser KI-System matched Sie automatisch mit den passenden Experten-Teams.')}
                </p>
                <div className="space-y-3">
                  {get<Array<{title: string; desc: string}>>('resourceHub.request.bullets', [
                    { title: 'Problem-zu-Lösung Matching', desc: 'KI-gestützte Service-Empfehlungen' },
                    { title: 'Schnelle Service-Aktivierung', desc: 'Services starten binnen 48h' },
                    { title: 'Garantierte Qualität', desc: 'SLA-backed Service Delivery' }
                  ])?.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Target className={`w-5 h-5 ${i===0?'text-blue-500': i===1?'text-orange-500':'text-green-500'} mt-0.5`} />
                      <div>
                        <div className="font-medium">{b.title}</div>
                        <div className="text-sm text-muted-foreground">{b.desc}</div>
                      </div>
                    </div>
                  ))}
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
                        <h4 className="font-semibold">{t('resourceHub.request.mock.title', 'Neue Service-Anfrage')}</h4>
                        <p className="text-sm text-muted-foreground">{t('resourceHub.request.mock.subtitle', 'Problem beschreiben')}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('resourceHub.request.mock.exampleLabel', 'Was möchten Sie erreichen?')}</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                          {t('resourceHub.request.mock.example', 'Automatisierung unserer Rechnungsverarbeitung mit KI-basierter Datenextraktion')}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('resourceHub.request.mock.type', 'Gewünschter Service-Typ')}</label>
                        <div className="mt-1 flex gap-2">
                          {get<string[]>('resourceHub.request.mock.tags', ['Backoffice Automation', 'KI/ML']).map((tag, i) => (
                            <Badge key={i} className={i===0? 'bg-blue-100 text-blue-700' : ''} variant={i===0? undefined: 'outline'}>{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('resourceHub.request.mock.timeline', 'Timeline & Budget')}</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                          {t('resourceHub.request.mock.timelineValue', 'Start: Innerhalb 2 Wochen • Budget: €15-25k/Monat')}
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <Brain className="w-4 h-4" />
                          <span className="text-sm font-medium">{t('resourceHub.request.mock.ai', 'KI-Empfehlung')}</span>
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          {t('resourceHub.request.mock.aiResult', '3 passende Experten-Teams gefunden • Geschätzte Implementierung: 4-6 Wochen')}
                        </div>
                      </div>
                      
                      <Button className="w-full bg-gradient-primary border-0">
                        {t('resourceHub.request.mock.cta', 'Service-Match starten')}
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
                        <h4 className="font-semibold">{t('resourceHub.analytics.title', 'Service Performance & ROI')}</h4>
                        <p className="text-sm text-muted-foreground">{t('resourceHub.analytics.subtitle', 'Letzte 90 Tage')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">312%</div>
                        <div className="text-sm text-muted-foreground">{t('resourceHub.analytics.roi', 'ROI Steigerung')}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">-67%</div>
                        <div className="text-sm text-muted-foreground">{t('resourceHub.analytics.savings', 'Kosteneinsparung')}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('resourceHub.analytics.deliveryRate', 'Service Delivery Rate')}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-green-100 rounded-full">
                            <div className="w-15 h-2 bg-green-500 rounded-full"></div>
                          </div>
                          <span className="text-sm font-bold text-green-600">97%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('resourceHub.analytics.avgTime', 'Ø Problem-zu-Lösung Zeit')}</span>
                        <span className="text-sm font-bold">3.2 Tage</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{t('resourceHub.analytics.quality', 'Service-Qualität Score')}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-bold">4.8/5</span>
                        </div>
                      </div>
                      
                      <div className="border-t pt-3 mt-3">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-blue-700">{t('resourceHub.analytics.impactTitle', 'Top Service-Impact')}</div>
                          <div className="text-xs text-blue-600">{t('resourceHub.analytics.impactDetail', 'Backoffice Automation: 45% Effizienzsteigerung')}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Explanation */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">{t('resourceHub.management.title2', 'Messbare Business-Erfolge')}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('resourceHub.management.text2', 'Verfolgen Sie den ROI Ihrer RaaS Services mit detaillierten Performance-Metriken. Sehen Sie, wie Remote-Services Ihr Business transformieren.')}
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">ROI-Tracking</div>
                      <div className="text-sm text-muted-foreground">{t('resourceHub.analytics.roi', 'Messbare Kosteneinsparungen und Effizienzsteigerungen')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Performance Analytics</div>
                      <div className="text-sm text-muted-foreground">{t('resourceHub.management.perf', 'Detaillierte Service-Leistungsbewertungen')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Business Impact</div>
                      <div className="text-sm text-muted-foreground">{t('resourceHub.management.impact', 'Konkrete Verbesserungen Ihrer Geschäftsprozesse')}</div>
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
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">{t('resourceHub.security.title', 'Enterprise-Grade Service Security')}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('resourceHub.security.subtitle', 'Ihre sensiblen Business-Daten sind bei unseren RaaS Services in sichersten Händen. Vollständige Compliance und höchste Sicherheitsstandards.')}
                </p>
                <div className="space-y-3">
                  {get<Array<{title: string; desc: string}>>('resourceHub.security.bullets', [
                    { title: 'Datensicherheit', desc: 'End-to-End Verschlüsselung aller Service-Daten' },
                    { title: 'Compliance & Zertifizierung', desc: 'ISO 27001, DSGVO, SOC 2 Type II' },
                    { title: 'Service Continuity', desc: '99.9% Uptime SLA für kritische Services' }
                  ])?.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Lock className={`w-5 h-5 ${i===0?'text-blue-500': i===1?'text-green-500':'text-purple-500'} mt-0.5`} />
                      <div>
                        <div className="font-medium">{b.title}</div>
                        <div className="text-sm text-muted-foreground">{b.desc}</div>
                      </div>
                    </div>
                  ))}
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
                        <h4 className="font-semibold">{t('resourceHub.security.status.title', 'Security & Compliance Status')}</h4>
                        <p className="text-sm text-muted-foreground">{t('resourceHub.security.status.subtitle', 'Alle Services überwacht')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {get<string[]>('resourceHub.security.status.badges', ['DSGVO', 'ISO 27001', 'SOC 2']).map((label, i) => (
                        <div key={i} className="bg-green-50 rounded-lg p-3 text-center">
                          {(i===0) ? <Lock className="w-6 h-6 text-green-600 mx-auto mb-2" /> : (i===1) ? <Globe className="w-6 h-6 text-green-600 mx-auto mb-2" /> : <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />}
                          <div className="text-xs font-medium">{label}</div>
                          <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">{t('resourceHub.security.items.encrypt', 'Service-Datenverschlüsselung')}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">{t('resourceHub.security.items.mfa', 'Multi-Factor Authentication')}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">{t('resourceHub.security.items.audit', 'Audit Logs & Monitoring')}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">{t('resourceHub.security.items.sla', 'Service SLA Monitoring')}</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-700">{t('resourceHub.security.status.uptime.title', 'Service Uptime')}</div>
                      <div className="text-2xl font-bold text-blue-600">{t('resourceHub.security.status.uptime.value', '99.97%')}</div>
                      <div className="text-xs text-blue-600">{t('resourceHub.security.status.uptime.caption', 'Letzte 12 Monate')}</div>
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
              {t('resourceHub.mainCta.open', 'RaaS Hub jetzt öffnen')}
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>

          {/* Feature Grid with Enhanced Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {get<Array<{title: string; desc: string}>>('resourceHub.features.cards', [
              { title: 'Intelligente Verwaltung', desc: 'KI-gestützte Automatisierung für mühelose Remote-Team Verwaltung' },
              { title: 'Enterprise Sicherheit', desc: 'Bank-level Sicherheit mit ISO 27001 Zertifizierung und DSGVO-Compliance' },
              { title: 'Global verfügbar', desc: '24/7 Support und weltweites Talent-Netzwerk für Ihren Erfolg' }
            ])?.map((card, i) => (
              <Card key={i} className="group text-center hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/80 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                <CardContent className="p-8 relative z-10">
                  <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-bounce shadow-lg">
                    {i===0 ? <Settings className="w-10 h-10 text-white" /> : i===1 ? <Shield className="w-10 h-10 text-white" /> : <Globe className="w-10 h-10 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground group-hover:text-brand-dark transition-colors">
                    {card.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium CTA Section */}
          <div className="bg-gradient-primary/5 border border-primary/20 rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark">
              {t('resourceHub.premium.title', 'Bereit für die Zukunft des Remote-Recruitings?')}
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t('resourceHub.premium.subtitle', 'Treten Sie ein in die neue Ära intelligenter Talent-Beschaffung und erleben Sie, wie KI Ihr Recruiting revolutioniert.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-10 py-6 bg-gradient-primary border-0 hover:scale-105 transition-transform" onClick={() => navigate('/auth')}>
                <UserCheck className="w-5 h-5 mr-2" />
                {t('resourceHub.premium.open', 'Hub jetzt öffnen')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300" onClick={() => navigate('/contact')}>
                {t('resourceHub.premium.demo', 'Demo anfragen')}
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