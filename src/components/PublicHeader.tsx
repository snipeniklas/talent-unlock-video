import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import heyTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

const PublicHeader = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b shadow-sm backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center animate-slide-in-left">
            <img 
              src={heyTalentLogo} 
              alt="HeyTalent" 
              className="h-8 md:h-10 hover:scale-105 transition-transform duration-300 cursor-pointer" 
              onClick={() => navigate('/')}
            />
          </div>
          <div className="hidden md:flex space-x-8">
            <button onClick={() => navigate('/solutions')} className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Lösungen</button>
            <button onClick={() => navigate('/how-we-work')} className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">So arbeiten wir</button>
            <button onClick={() => navigate('/resource-hub')} className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Resource Hub</button>
            <button onClick={() => navigate('/use-cases')} className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Use Cases</button>
            <button onClick={() => navigate('/about')} className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Über uns</button>
            <button onClick={() => navigate('/contact')} className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium">Kontakt</button>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild className="hidden md:inline-flex">
              <a href="/auth">Login</a>
            </Button>
            <Button className="bg-primary hover:bg-primary-hover">
              Kostenloses Strategiegespräch
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicHeader;