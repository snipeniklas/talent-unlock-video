import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import BenefitBanner from "@/components/BenefitBanner";
import hejTalentLogo from '/lovable-uploads/bb059d26-d976-40f0-a8c9-9aa48d77e434.png';

const PublicHeader = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { title: "Startseite", path: "/" },
    { title: "RaaS Lösungen", path: "/solutions" },
    { title: "So arbeiten wir", path: "/how-we-work" },
    { title: "RaaS Hub", path: "/resource-hub" },
    { title: "Kontakt", path: "/contact" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between w-full">
            {/* Logo */}
            <div className="flex items-center animate-slide-in-left">
              <img 
                src={hejTalentLogo} 
                alt="HejTalent"
                className="h-8 md:h-10 hover:scale-105 transition-transform duration-300 cursor-pointer" 
                onClick={() => navigate('/')}
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navigationItems.map((item) => (
                <button 
                  key={item.title}
                  onClick={() => navigate(item.path)} 
                  className="text-brand-dark/80 hover:text-brand-dark transition-colors font-medium"
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/auth">Login</a>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary-hover">
                <Link to="/app/search-requests/new">RaaS Anfrage erstellen</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center space-x-2 md:hidden">
              <Button asChild size="sm" className="bg-primary hover:bg-primary-hover">
                <Link to="/app/search-requests/new">RaaS Anfrage</Link>
              </Button>
              
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-white">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <img 
                        src={hejTalentLogo} 
                        alt="HejTalent"
                        className="h-8" 
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 py-6">
                      <nav className="space-y-4">
                        {navigationItems.map((item) => (
                          <button
                            key={item.title}
                            onClick={() => handleNavigation(item.path)}
                            className="block w-full text-left px-2 py-3 text-brand-dark/80 hover:text-brand-dark hover:bg-gray-50 rounded-md transition-colors font-medium"
                          >
                            {item.title}
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Mobile Actions */}
                    <div className="border-t pt-4 space-y-3">
                      <Button variant="outline" asChild className="w-full">
                        <a href="/auth">Login</a>
                      </Button>
                      <Button asChild className="w-full bg-primary hover:bg-primary-hover">
                        <Link to="/app/search-requests/new">RaaS Anfrage erstellen</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      <BenefitBanner />
    </>
  );
};

export default PublicHeader;