import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Mail, Phone, Star, Calendar, Briefcase, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Specialist {
  id: string;
  name: string;
  title: string;
  location: string;
  skills: string[];
  availability: "available" | "busy" | "unavailable";
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  experience?: string;
  rating?: number;
  completedProjects?: number;
  languages?: string[];
  certifications?: string[];
  portfolio?: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
}

const SpecialistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockData: Specialist = {
        id: id || "1",
        name: "Sarah Mueller",
        title: "Senior Frontend Developer",
        location: "Berlin, Deutschland",
        skills: ["React", "TypeScript", "Next.js", "Node.js", "MongoDB", "AWS"],
        availability: "available",
        email: "sarah.mueller@example.com",
        phone: "+49 30 12345678",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        bio: "Erfahrene Frontend-Entwicklerin mit über 8 Jahren Expertise in der Entwicklung moderner Web-Anwendungen. Spezialisiert auf React, TypeScript und performante User Interfaces. Leidenschaftlich bei der Umsetzung von komplexen Designs in sauberen, wartbaren Code.",
        experience: "8+ Jahre",
        rating: 4.9,
        completedProjects: 47,
        languages: ["Deutsch (Muttersprache)", "Englisch (Fließend)", "Französisch (Grundkenntnisse)"],
        certifications: [
          "AWS Certified Developer",
          "React Professional Certification",
          "TypeScript Advanced Certification"
        ],
        portfolio: [
          {
            title: "E-Commerce Platform",
            description: "Vollständige Entwicklung einer modernen E-Commerce-Plattform mit React, TypeScript und Stripe Integration.",
            technologies: ["React", "TypeScript", "Stripe", "Node.js"]
          },
          {
            title: "Fintech Dashboard",
            description: "Entwicklung eines komplexen Fintech-Dashboards mit Echtzeit-Daten und fortgeschrittenen Visualisierungen.",
            technologies: ["React", "D3.js", "WebSocket", "Material-UI"]
          },
          {
            title: "Mobile App",
            description: "React Native App für iOS und Android mit Backend-Integration und Push-Notifications.",
            technologies: ["React Native", "Firebase", "Redux", "TypeScript"]
          }
        ]
      };
      setSpecialist(mockData);
      setLoading(false);
    }, 500);
  }, [id]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "busy": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unavailable": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available": return "Verfügbar";
      case "busy": return "Teilweise verfügbar";
      case "unavailable": return "Nicht verfügbar";
      default: return availability;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Spezialist nicht gefunden</h2>
          <p className="text-muted-foreground mt-2">Der angeforderte Spezialist existiert nicht.</p>
          <Button onClick={() => navigate("/app/specialists")} className="mt-4">
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate("/app/specialists")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-16 w-16">
          <AvatarImage src={specialist.avatar} alt={specialist.name} />
          <AvatarFallback>{specialist.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{specialist.name}</h1>
          <p className="text-xl text-muted-foreground">{specialist.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{specialist.location}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {specialist.bio && (
            <Card>
              <CardHeader>
                <CardTitle>Über mich</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {specialist.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {specialist.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio */}
          {specialist.portfolio && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Auswahl meiner letzten Projekte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {specialist.portfolio.map((project, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold">{project.title}</h4>
                    <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {specialist.certifications && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Zertifizierungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {specialist.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Availability & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Verfügbarkeit & Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge className={getAvailabilityColor(specialist.availability)}>
                  {getAvailabilityText(specialist.availability)}
                </Badge>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  Anfrage senden
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail senden
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Anrufen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiken</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {specialist.rating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bewertung:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{specialist.rating}/5</span>
                  </div>
                </div>
              )}
              {specialist.experience && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Erfahrung:</span>
                  <span className="text-sm">{specialist.experience}</span>
                </div>
              )}
              {specialist.completedProjects && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Projekte:</span>
                  <span className="text-sm">{specialist.completedProjects}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Kontaktdaten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{specialist.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{specialist.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          {specialist.languages && (
            <Card>
              <CardHeader>
                <CardTitle>Sprachen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {specialist.languages.map((language, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {language}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialistDetail;