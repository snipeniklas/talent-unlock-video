import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n/i18n';

interface MiniTeamMember {
  name: string;
  role: string;
  image?: string;
  initials: string;
  quote: string;
}

interface MiniTeamSectionProps {
  className?: string;
}

export const MiniTeamSection: React.FC<MiniTeamSectionProps> = ({ className = "" }) => {
  const { t } = useTranslation();

  const teamMembers: MiniTeamMember[] = [
    {
      name: "Joachim Kalff",
      role: t('miniTeam.joachim.role', 'Gründer & Geschäftsführer'),
      image: "/lovable-uploads/joachim-kalff.jpg",
      initials: "JK",
      quote: t('miniTeam.joachim.quote', 'Mit unserem RaaS-Konzept denken wir HR-Prozesse neu: frischer, smarter, einfach besser!')
    },
    {
      name: "Pascal Schmidt",
      role: t('miniTeam.pascal.role', 'Co-Gründer & Head of Talent'),
      image: "/lovable-uploads/pascal-schmidt.jpg",
      initials: "PS",
      quote: t('miniTeam.pascal.quote', 'Echte Verbindungen zwischen Unternehmen und Talenten schaffen – das ist unser Antrieb.')
    }
  ];

  return (
    <section className={`py-12 md:py-16 bg-gradient-subtle ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4">
              {t('miniTeam.title', 'Die Köpfe hinter Hej Talent')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('miniTeam.subtitle', 'Lernen Sie unsere Gründer kennen und erfahren Sie mehr über unsere Vision')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {teamMembers.map((member, index) => (
              <Card 
                key={member.name}
                className="p-6 hover:shadow-lg transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden relative">
                      {member.image ? (
                        <img 
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Avatar className="w-20 h-20" style={{ display: member.image ? 'none' : 'flex' }}>
                        <AvatarFallback className="text-lg font-semibold bg-primary text-white">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-1 group-hover:text-primary transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-primary font-semibold mb-3">
                      {member.role}
                    </p>
                    <blockquote className="text-muted-foreground italic leading-relaxed">
                      "{member.quote}"
                    </blockquote>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              asChild
              className="group hover:bg-primary hover:text-white transition-all duration-300"
            >
              <Link to="/about-us">
                {t('miniTeam.cta', 'Mehr über unser Team erfahren')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};