import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, FileText, BarChart, Settings, Lock, Shield } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import ContactCTA from "@/components/ContactCTA";
import InteractiveAppScreen from "@/components/InteractiveAppScreen";

const ResourceHub = () => {
  return (
    <div className="min-h-screen bg-background font-inter">
      <PublicHeader />
      
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-brand-dark mb-6 leading-tight">
              Resource Hub - Ihr Login-Bereich
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Zugang zu Ihren Remote-Fachkräften, Projekten und allen wichtigen Ressourcen
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Fachkräfte-Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Verwalten Sie Ihre Remote-Teams und Kandidaten</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Projekt-Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Alle Ihre Projekte und Anfragen im Überblick</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Leistungsberichte und Projekterfolg</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Interactive Platform Preview */}
          <div className="mt-20 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-dark">
                Vorschau: Ihre Plattform-Oberfläche
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Werfen Sie einen Blick auf die intuitive Benutzeroberfläche, 
                die Sie nach dem Login erwartet.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Customer Dashboard Preview */}
              <InteractiveAppScreen
                title="Ihr Dashboard"
                description="Zentrale Übersicht über alle Ihre Projekte und Anfragen"
                screen="dashboard"
              />

              {/* Search Requests Preview */}
              <InteractiveAppScreen
                title="Suchaufträge verwalten"
                description="Erstellen und verwalten Sie Ihre Anfragen für Remote-Fachkräfte"
                screen="search-requests"
              />
            </div>

            <div className="grid lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
              {/* Candidate Preview */}
              <InteractiveAppScreen
                title="Vorgeschlagene Bewerber"
                description="Entdecken Sie von HeyTalent sorgfältig ausgewählte Bewerber für Ihre Projekte"
                screen="candidates"
              />
            </div>

            {/* Enhanced CTA Section */}
            <div className="bg-gradient-subtle rounded-2xl p-8 mt-16">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-brand-dark">
                  Bereit für den Zugang zu Ihren Remote-Fachkräften?
                </h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Loggen Sie sich ein und erleben Sie, wie einfach es ist, 
                  qualifizierte Remote-Talente für Ihr Unternehmen zu verwalten.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover" asChild>
                    <a href="/auth">
                      Jetzt einloggen 
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                    <a href="/contact">
                      Support kontaktieren
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature Details */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Settings className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Einfache Verwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intuitive Benutzeroberfläche für die mühelose Verwaltung 
                  Ihrer Remote-Teams und Projekte
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Lock className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>Sicher & Datenschutz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Höchste Sicherheitsstandards und DSGVO-konforme 
                  Datenverarbeitung für Ihr Vertrauen
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white p-4" />
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Unser Support-Team steht Ihnen jederzeit für Fragen 
                  und technische Unterstützung zur Verfügung
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary-hover" asChild>
              <a href="/auth">Zum Login-Bereich <ArrowRight className="w-5 h-5 ml-2" /></a>
            </Button>
          </div>
        </div>
      </section>
      
      <ContactCTA />
      <PublicFooter />
    </div>
  );
};

export default ResourceHub;