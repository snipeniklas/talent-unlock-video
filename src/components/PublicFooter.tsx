import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

const PublicFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-brand-dark text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6">HejTalent, a hej consulting GmbH brand</h3>
            <p className="text-white/80 mb-6">
              Ihr vertrauensvoller Partner für qualifizierte internationale Remote-Fachkräfte.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer">
                <Twitter className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer">
                <Facebook className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Unsere Lösungen</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/solutions/backoffice')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Remote Backoffice-Fachkräfte
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/solutions/it-development')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Remote IT-Entwickler
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/solutions/ai-ml')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Remote KI-Spezialisten
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Unternehmen</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/how-we-work')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  So arbeiten wir
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/resource-hub')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Resource Hub
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Kontakt
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Kontakt</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:kontakt@hejcompany.de" className="text-white/80 hover:text-white transition-colors">
                  kontakt@hejcompany.de
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+498990176218" className="text-white/80 hover:text-white transition-colors">
                  +49 89 9017 6218
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-white/80">Nördliche Münchner Str. 9c, 82031 Grünwald, Germany</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/60 mb-4 md:mb-0">
              © 2024 HejTalent, a hej consulting GmbH brand. Alle Rechte vorbehalten.
            </div>
            <div className="flex space-x-6">
              <button 
                onClick={() => navigate('/datenschutz')}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Datenschutz
              </button>
              <button 
                onClick={() => navigate('/impressum')}
                className="text-white/60 hover:text-white transition-colors text-sm"
              >
                Impressum
              </button>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">
                AGB
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;