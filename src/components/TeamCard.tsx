import React from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  initials: string;
  bio: {
    p1: string;
    p2: string;
    p3: string;
  };
  qa: {
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
  };
}

interface TeamCardProps {
  member: TeamMember;
}

export const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
  return (
    <Card className="p-8 hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 mb-4 rounded-full overflow-hidden">
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
          <Avatar className="w-24 h-24" style={{ display: member.image ? 'none' : 'flex' }}>
            <AvatarFallback className="text-xl font-semibold bg-primary text-white">
              {member.initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <h3 className="text-2xl font-bold text-brand-dark mb-2">{member.name}</h3>
        <p className="text-lg text-primary font-semibold">{member.role}</p>
      </div>
      <div className="text-muted-foreground leading-relaxed">
        <p className="mb-4">{member.bio.p1}</p>
        <p className="mb-4">{member.bio.p2}</p>
        <p className="mb-6">{member.bio.p3}</p>
        
        {/* Q&A Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <h4 className="font-semibold text-brand-dark mb-2">{member.qa.q1}</h4>
            <p className="text-sm">{member.qa.a1}</p>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-2">{member.qa.q2}</h4>
            <p className="text-sm">{member.qa.a2}</p>
          </div>
          <div>
            <h4 className="font-semibold text-brand-dark mb-2">{member.qa.q3}</h4>
            <p className="text-sm">{member.qa.a3}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};