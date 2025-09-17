import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimelineActivity {
  id: string;
  title: string;
  duration: number; // in weeks
  startWeek: number;
  status: 'completed' | 'active' | 'upcoming';
  description?: string;
  optional?: boolean;
}

interface ProjectTimelineProps {
  onActivityClick?: (activity: TimelineActivity) => void;
  className?: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ onActivityClick, className = "" }) => {
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  const { t } = useLanguage();

  const activities: TimelineActivity[] = [
    {
      id: '1',
      title: t('timeline.activities.consultation.title'),
      duration: 0.5,
      startWeek: 0,
      status: 'completed',
      description: t('timeline.activities.consultation.description'),
      optional: true
    },
    {
      id: '2',
      title: t('timeline.activities.requirements.title'),
      duration: 0.2,
      startWeek: 0.5,
      status: 'active',
      description: t('timeline.activities.requirements.description')
    },
    {
      id: '3a',
      title: t('timeline.activities.candidates.title'),
      duration: 1,
      startWeek: 0.7,
      status: 'upcoming',
      description: t('timeline.activities.candidates.description')
    },
    {
      id: '3b',
      title: t('timeline.activities.selection.title'),
      duration: 0.8,
      startWeek: 1.7,
      status: 'upcoming',
      description: t('timeline.activities.selection.description')
    },
    {
      id: '4',
      title: t('timeline.activities.implementation.title'),
      duration: 0.5,
      startWeek: 2.5,
      status: 'upcoming',
      description: t('timeline.activities.implementation.description')
    }
  ];

  const totalWeeks = 3;
  const weekLabels = [t('timeline.weeks.optional'), t('timeline.weeks.week1'), t('timeline.weeks.week2'), t('timeline.weeks.week3')];

  const getActivityBarStyle = (activity: TimelineActivity) => {
    const startPercent = (activity.startWeek / totalWeeks) * 100;
    const widthPercent = (activity.duration / totalWeeks) * 100;
    
    let bgColor = 'bg-muted';
    let borderStyle = 'border-dashed border-muted-foreground/30';
    
    if (activity.status === 'completed') {
      bgColor = 'bg-green-500';
      borderStyle = 'border-solid border-green-600';
    } else if (activity.status === 'active') {
      bgColor = 'bg-primary';
      borderStyle = 'border-solid border-primary';
    } else if (activity.status === 'upcoming') {
      bgColor = 'bg-primary/60';
      borderStyle = 'border-dashed border-primary/40';
    }

    return {
      left: `${startPercent}%`,
      width: `${widthPercent}%`,
      background: `hsl(var(--${bgColor.split('-')[1] === 'green' ? 'green-500' : bgColor.includes('primary') ? 'primary' : 'muted'}))`,
      borderColor: activity.status === 'completed' ? 'hsl(142 71% 45%)' : 
                   activity.status === 'active' ? 'hsl(var(--primary))' : 
                   'hsl(var(--primary) / 0.4)'
    };
  };

  const getStatusIcon = (status: TimelineActivity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Play className="w-4 h-4 text-primary animate-pulse" />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleActivityClick = (activity: TimelineActivity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

  return (
    <Card className={`w-full bg-white/90 backdrop-blur-sm border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl font-semibold text-brand-dark">
            {t('timeline.title')}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{t('timeline.process')}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Timeline Header */}
        <div className="grid grid-cols-4 gap-1 text-xs font-medium text-muted-foreground border-b border-border pb-2">
          {weekLabels.map((week, index) => (
            <div 
              key={index} 
              className={`text-center ${index < 1 ? 'text-muted-foreground/60' : 'text-brand-dark'}`}
            >
              {week}
            </div>
          ))}
        </div>

        {/* Activities */}
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="space-y-2">
              {/* Activity Header */}
              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                  hoveredActivity === activity.id ? 'bg-primary/5 border border-primary/20' : 'border border-transparent'
                }`}
                onMouseEnter={() => setHoveredActivity(activity.id)}
                onMouseLeave={() => setHoveredActivity(null)}
                onClick={() => handleActivityClick(activity)}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <span className="text-sm font-medium text-brand-dark">
                      {index + 1}. {activity.title}
                      {activity.optional && (
                        <span className="text-xs text-muted-foreground ml-1">{t('timeline.optional')}</span>
                      )}
                    </span>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.duration === 0.2 ? t('timeline.duration.day1') : 
                   activity.duration === 0.5 ? t('timeline.duration.days3') :
                   activity.duration === 0.8 ? t('timeline.duration.days6') :
                   activity.duration === 1 ? t('timeline.duration.days7') :
                   activity.duration === 1.5 ? t('timeline.duration.days10') :
                   t('timeline.duration.days').replace('{count}', Math.ceil(activity.duration * 7).toString())}
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="relative h-6 bg-muted/30 rounded-lg border border-border overflow-hidden">
                <div 
                  className={`absolute top-0 h-full rounded-md border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                    hoveredActivity === activity.id ? 'shadow-md' : ''
                  }`}
                  style={getActivityBarStyle(activity)}
                  onClick={() => handleActivityClick(activity)}
                >
                  {/* Progress indicator for active tasks */}
                  {activity.status === 'active' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  )}
                </div>
                
                {/* Week separators */}
                {[1, 2].map((week) => (
                  <div 
                    key={week}
                    className="absolute top-0 bottom-0 w-px bg-border"
                    style={{ left: `${(week / totalWeeks) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Milestones */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-sm font-medium text-brand-dark">{t('timeline.milestones.kickoff')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-brand-dark">{t('timeline.milestones.firstDay')}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4">
          <Button 
            className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-300 border-0"
            onClick={() => handleActivityClick(activities[0])}
          >
            <Play className="w-4 h-4 mr-2" />
            {t('timeline.cta')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;