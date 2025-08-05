import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Code, Shield, Star, CheckCircle, Mail, Phone, Linkedin, MapPin } from "lucide-react";
import { useState } from "react";

const HomePage = () => {
  const [activeService, setActiveService] = useState(0);

  const services = [
    {
      title: "KI-Entwickler Vermittlung",
      description: "Qualifizierte AI-Entwickler aus Deutschland und Europa für Ihre Projekte",
      features: ["Umfassende Prüfung", "Direkte Vermittlung", "Projektbasiert oder Festanstellung"]
    },
    {
      title: "Team-Building",
      description: "Komplette Entwicklerteams für größere KI-Projekte",
      features: ["Skalierbare Teams", "Verschiedene Expertisen", "Agile Methoden"]
    },
    {
      title: "Consulting",
      description: "Beratung für KI-Strategien und Technologie-Entscheidungen",
      features: ["Strategieberatung", "Technologie-Evaluation", "Implementation Support"]
    }
  ];

  const stats = [
    { label: "Geprüfte Entwickler", value: "500+" },
    { label: "Erfolgreiche Projekte", value: "150+" },
    { label: "Zufriedene Kunden", value: "98%" },
    { label: "Durchschnittliche Projektdauer", value: "6 Monate" }
  ];

  const testimonials = [
    {
      name: "Dr. Marcus Weber",
      company: "TechCorp GmbH",
      text: "HejTalent hat uns dabei geholfen, unser KI-Team innerhalb von 4 Wochen zu vervollständigen. Die Qualität der Entwickler ist ausgezeichnet.",
      rating: 5
    },
    {
      name: "Sarah Mueller",
      company: "InnovateAI",
      text: "Professionelle Abwicklung und top qualifizierte Kandidaten. Wir haben bereits mehrere Projekte erfolgreich umgesetzt.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary">HejTalent</h1>
              <div className="hidden md:flex space-x-6">
                <a href="#services" className="text-foreground/80 hover:text-foreground transition-colors">Services</a>
                <a href="#about" className="text-foreground/80 hover:text-foreground transition-colors">Über uns</a>
                <a href="#testimonials" className="text-foreground/80 hover:text-foreground transition-colors">Referenzen</a>
                <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors">Kontakt</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <a href="/landing">Landing Page</a>
              </Button>
              <Button>
                Kostenlose Beratung
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="w-4 h-4 mr-2" />
            Vertrauenspartner für KI-Entwicklung
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Ihre Experten für
            <br />KI-Entwickler
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Wir verbinden Unternehmen mit den besten KI-Entwicklern aus Deutschland und Europa. 
            Von der ersten Beratung bis zur erfolgreichen Projektumsetzung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Projekt starten
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Mehr erfahren
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unsere Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Maßgeschneiderte Lösungen für Ihre KI-Projekte und Entwicklerbedarfe
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeService === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveService(index)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-6 h-6 text-primary" />
                    {service.title}
                  </CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/50 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Über HejTalent</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Seit 2020 sind wir der vertrauensvolle Partner für Unternehmen, die auf der Suche nach 
                erstklassigen KI-Entwicklern sind. Unser Fokus liegt auf der gründlichen Prüfung und 
                Vermittlung von Talenten aus Deutschland und Europa.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <span>Umfassende Background-Checks</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <span>Persönliche Betreuung</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  <span>Qualitätsgarantie</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <Code className="w-24 h-24 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Was unsere Kunden sagen</h2>
            <p className="text-xl text-muted-foreground">
              Vertrauen Sie auf die Erfahrungen unserer zufriedenen Kunden
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/50 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kontakt aufnehmen</h2>
            <p className="text-xl text-muted-foreground">
              Lassen Sie uns gemeinsam Ihr KI-Projekt verwirklichen
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold">Sprechen Sie uns an</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href="mailto:kontakt@hejcompany.de" className="hover:text-primary transition-colors">
                    kontakt@hejcompany.de
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <a href="tel:+4989901762180" className="hover:text-primary transition-colors">
                    +49 89 9017 6218
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="w-5 h-5 text-primary" />
                  <a href="https://www.linkedin.com/company/hejtalent/?originalSubdomain=de" 
                     target="_blank" rel="noopener noreferrer" 
                     className="hover:text-primary transition-colors">
                    LinkedIn Profil
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>München, Deutschland</span>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle>Kostenlose Beratung anfragen</CardTitle>
                <CardDescription>
                  Erzählen Sie uns von Ihrem Projekt und wir melden uns binnen 24 Stunden
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Button className="w-full" size="lg">
                  Jetzt Beratung anfragen
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4">HejTalent</h3>
              <p className="text-gray-300 text-sm">
                Ihr Partner für geprüfte KI-Entwickler aus Deutschland und Europa.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://hejtalent.de/imprint-de/" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Impressum</a></li>
                <li><a href="https://hejtalent.de/privacy-policy-de/" className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Datenschutz</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="mailto:kontakt@hejcompany.de" className="hover:text-white transition-colors">
                    kontakt@hejcompany.de
                  </a>
                </li>
                <li>
                  <a href="tel:+4989901762180" className="hover:text-white transition-colors">
                    +49 89 9017 6218
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Social Media</h4>
              <a href="https://www.linkedin.com/company/hejtalent/?originalSubdomain=de" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-300 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-300">
            © 2025 HejTalent. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;