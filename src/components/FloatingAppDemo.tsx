import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RaasInquiryDialog } from '@/components/RaasInquiryDialog';
import { useTranslation } from '@/i18n/i18n';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Search, 
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  Star,
  ArrowUp,
  Target,
  Zap
} from "lucide-react";

interface FloatingAppDemoProps {
  title: string;
  description: string;
}

const FloatingAppDemo: React.FC<FloatingAppDemoProps> = ({ title, description }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { get } = useTranslation();

  return (
    <div className="relative">
      {/* Main Container */}
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4">{title}</h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Floating Demo Area */}
      <div className="relative min-h-[600px] bg-gradient-subtle rounded-3xl p-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-purple-500 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Main Dashboard Card */}
        <Card 
          className="absolute top-8 left-8 w-80 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-30"
          onMouseEnter={() => setHoveredCard('dashboard')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">{get('home.hub.floatingDemo.cards.dashboard.title')}</h4>
              <Badge className="bg-green-100 text-green-700 border-green-200">{get('home.hub.floatingDemo.cards.dashboard.live')}</Badge>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-primary/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{get('home.hub.floatingDemo.cards.dashboard.activeProjects')}</span>
                </div>
                <div className="text-2xl font-bold text-brand-dark">12</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">{get('home.hub.floatingDemo.cards.dashboard.successRate')}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">98%</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{get('home.floatingDemo.cards.dashboard.remoteDevelopers')}</span>
                <span className="font-medium">8 {get('home.floatingDemo.cards.dashboard.developersActive')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{get('home.floatingDemo.cards.dashboard.backofficeStaff')}</span>
                <span className="font-medium">5 {get('home.floatingDemo.cards.dashboard.staffActive')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Request Card */}
        <Card 
          className="absolute top-20 right-8 w-72 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-20"
          onMouseEnter={() => setHoveredCard('search')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
            <div>
              <h4 className="font-semibold">{get('home.hub.floatingDemo.cards.request.title')}</h4>
              <p className="text-sm text-muted-foreground">{get('home.hub.floatingDemo.cards.request.subtitle')}</p>
            </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{get('home.hub.floatingDemo.cards.request.response24h')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-green-500" />
                <span>3 {get('home.hub.floatingDemo.cards.request.candidatesFound')}</span>
              </div>
              
              <Button size="sm" className="w-full bg-gradient-primary border-0">
                {get('home.hub.floatingDemo.cards.request.viewDetails')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resource Pool Card */}
        <Card 
          className="absolute bottom-8 left-12 w-64 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-25"
          onMouseEnter={() => setHoveredCard('resources')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            <div>
              <h4 className="font-semibold">{get('home.hub.floatingDemo.cards.resourcePool.title')}</h4>
              <p className="text-sm text-muted-foreground">{get('home.hub.floatingDemo.cards.resourcePool.subtitle')}</p>
            </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{get('home.hub.floatingDemo.cards.resourcePool.aiExperts')}</span>
                <Badge variant="secondary" className="text-xs">12</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{get('home.hub.floatingDemo.cards.resourcePool.fullstackDev')}</span>
                <Badge variant="secondary" className="text-xs">8</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">{get('home.hub.floatingDemo.cards.resourcePool.backoffice')}</span>
                <Badge variant="secondary" className="text-xs">15</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Card */}
        <Card 
          className="absolute bottom-16 right-12 w-60 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-15"
          onMouseEnter={() => setHoveredCard('metrics')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">{get('home.hub.floatingDemo.cards.performance.title')}</h4>
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3 text-green-500" />
                  <span className="text-sm text-green-600">{get('home.hub.floatingDemo.cards.performance.increase')}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>{get('home.hub.floatingDemo.cards.performance.successfulMatches')}</span>
                <span className="font-bold text-green-600">94%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{get('home.hub.floatingDemo.cards.performance.avgPlacement')}</span>
                <span className="font-bold">2.1 {get('home.hub.floatingDemo.cards.performance.weeks')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{get('home.hub.floatingDemo.cards.performance.satisfaction')}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">4.9</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Toast */}
        <Card 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 bg-white/95 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 z-35"
          onMouseEnter={() => setHoveredCard('notification')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{get('home.floatingDemo.cards.notification.title')}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {get('home.floatingDemo.cards.notification.description')}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-gradient-primary border-0">
                    {get('home.floatingDemo.cards.notification.viewProfile')}
                  </Button>
                  <Button size="sm" variant="ghost">
                    {get('home.floatingDemo.cards.notification.later')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
          <div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40"
            onMouseEnter={() => setHoveredCard('cta')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <RaasInquiryDialog
              source="floating-demo"
              trigger={
                <Button className="bg-gradient-primary border-0 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 px-8 py-6 text-lg">
                  <Zap className="w-5 h-5 mr-2" />
                  {get('home.hub.floatingDemo.cards.cta')}
                </Button>
              }
            />
          </div>
      </div>
    </div>
  );
};

export default FloatingAppDemo;